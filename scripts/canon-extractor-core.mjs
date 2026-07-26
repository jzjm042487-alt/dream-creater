import { createHash } from "node:crypto";

const CHINESE_DIGITS = new Map([
  ["零", 0],
  ["〇", 0],
  ["一", 1],
  ["二", 2],
  ["两", 2],
  ["三", 3],
  ["四", 4],
  ["五", 5],
  ["六", 6],
  ["七", 7],
  ["八", 8],
  ["九", 9]
]);

const CHINESE_UNITS = new Map([
  ["十", 10],
  ["百", 100],
  ["千", 1000],
  ["万", 10000]
]);

const PATH_NAMES = [
  "天道",
  "人道",
  "智道",
  "力道",
  "魂道",
  "宙道",
  "宇道",
  "运道",
  "气道",
  "血道",
  "梦道",
  "偷道",
  "盗道",
  "变化道",
  "炼道",
  "阵道",
  "信道",
  "食道",
  "奴道",
  "剑道",
  "刀道",
  "水道",
  "火道",
  "炎道",
  "土道",
  "木道",
  "金道",
  "冰道",
  "雪道",
  "雷道",
  "风道",
  "光道",
  "暗道",
  "星道",
  "律道",
  "音道",
  "虚道",
  "画道",
  "兵道",
  "丹道",
  "香道",
  "骨道",
  "毒道",
  "幻道",
  "情道"
];

const FACT_TAG_RULES = [
  ["ability", /能够|能令|效用|作用|威能|专门|用来|效果|增幅|辅助|治疗|防御|侦察|移动|精炼/],
  ["acquisition", /取得|得到|获得|夺取|换取|捕获|收取|购买|买下|交易|继承|赠予|赠送|借来|寻得/],
  ["refinement", /炼制|炼成|合炼|升炼|蛊方|秘方|残方/],
  ["feeding", /喂养|食料|饥饿|饿死|喂食/],
  ["location", /藏在|位于|产出|盛产|生长|出没|栖息|福地|洞天|山寨|山谷|海域/],
  ["owner", /拥有|手中|本命|主人|之物|持有|掌握/],
  ["development", /升炼|晋升|进阶|合炼|后续|系列|提升到|成长为/]
];

const GENERIC_GU_TERMS = new Set([
  "蛊",
  "此蛊",
  "该蛊",
  "那蛊",
  "仙蛊",
  "凡蛊",
  "野蛊",
  "本命蛊",
  "核心蛊",
  "一转蛊",
  "二转蛊",
  "三转蛊",
  "四转蛊",
  "五转蛊",
  "六转蛊",
  "七转蛊",
  "八转蛊",
  "九转蛊"
]);

const GU_NAME_ACTION_FRAGMENTS = [
  "炼制",
  "催动",
  "狂催",
  "催发",
  "动用",
  "使用",
  "拥有",
  "获得",
  "得到",
  "取得",
  "掌握",
  "失去",
  "借来",
  "换取",
  "收取",
  "捕获",
  "持有",
  "舍弃",
  "拿出",
  "取出",
  "收起",
  "撤销",
  "撤掉",
  "撑起",
  "顶起",
  "发动",
  "激活",
  "祭出",
  "喂养",
  "升炼",
  "借助",
  "依靠",
  "通过",
  "问及",
  "提到",
  "盛产",
  "产出",
  "保存",
  "保护",
  "只剩",
  "安置",
  "按照",
  "包含",
  "包括",
  "保持",
  "保留",
  "保住",
  "帮助",
  "需要",
  "想要",
  "打算",
  "利用",
  "参与",
  "拿着",
  "交给",
  "搭配",
  "买下",
  "收购",
  "售卖",
  "借取",
  "炼化",
  "炼出",
  "对"
];

export function parseChineseNumber(value) {
  if (/^\d+$/.test(value)) return Number(value);

  let total = 0;
  let section = 0;
  let digit = 0;

  for (const character of value) {
    if (CHINESE_DIGITS.has(character)) {
      digit = CHINESE_DIGITS.get(character);
      continue;
    }

    const unit = CHINESE_UNITS.get(character);
    if (!unit) throw new Error(`Unsupported Chinese number character: ${character}`);

    if (unit === 10000) {
      total += (section + digit || 1) * unit;
      section = 0;
      digit = 0;
    } else {
      section += (digit || 1) * unit;
      digit = 0;
    }
  }

  return total + section + digit;
}

export function parseCorpus(text) {
  const lines = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
  const chapters = [];
  const lineChapterIds = new Array(lines.length).fill(null);
  let volume = 1;
  let previousSection = null;
  let currentChapter = null;

  for (let index = 0; index < lines.length; index += 1) {
    const match = matchHeading(lines[index]);

    if (match) {
      const sourceSection = parseChineseNumber(match[1]);
      const nextSourceSection = findNextHeadingSection(lines, index + 1);
      const shouldRepairSequence =
        previousSection !== null &&
        sourceSection > previousSection + 1 &&
        nextSourceSection === previousSection + 2;
      const section = shouldRepairSequence ? previousSection + 1 : sourceSection;
      if (previousSection !== null && previousSection >= 100 && section <= 5) volume += 1;

      currentChapter = {
        id: chapterId(volume, section),
        volume,
        section,
        sourceSection,
        sectionCorrection: shouldRepairSequence ? "sequence-repair" : null,
        title: match[2].trim(),
        sourceLine: index + 1
      };
      chapters.push(currentChapter);
      previousSection = section;
    }

    lineChapterIds[index] = currentChapter?.id ?? null;
  }

  return {
    lineCount: lines.length,
    lines,
    lineChapterIds,
    chapters,
    volumes: summarizeVolumes(chapters)
  };
}

export function extractGuMentions(corpus, { seedNames = [] } = {}) {
  const records = new Map();
  const chapterById = new Map(corpus.chapters.map((chapter) => [chapter.id, chapter]));
  const seeds = [...new Set(seedNames)].filter(Boolean).sort((a, b) => b.length - a.length);

  for (let index = 0; index < corpus.lines.length; index += 1) {
    const line = corpus.lines[index];
    if (!line.includes("蛊") && !seeds.some((name) => line.includes(name))) continue;

    const names = new Map();
    for (const candidate of extractSignalNames(line)) {
      names.set(candidate, "explicit");
    }
    for (const candidate of extractGuSuffixNames(line)) {
      if (!names.has(candidate)) names.set(candidate, "suffix");
    }
    for (const seed of seeds) {
      if (line.includes(seed) && !names.has(seed)) names.set(seed, "seed");
    }

    const chapterIdValue = corpus.lineChapterIds[index];
    const chapter = chapterById.get(chapterIdValue);
    if (!chapter) continue;

    for (const [name, reason] of names) {
      const ranks = extractRanksNearName(line, name);
      const paths = PATH_NAMES.filter((path) => line.includes(path));
      const factTags = FACT_TAG_RULES.filter(([, pattern]) => pattern.test(line)).map(
        ([tag]) => tag
      );
      const record = records.get(name) ?? {
        name,
        confidence: reason === "explicit" ? "high" : reason === "seed" ? "seeded" : "medium",
        mentionCount: 0,
        ranks: new Set(),
        paths: new Set(),
        factTags: new Set(),
        evidence: []
      };

      record.mentionCount += 1;
      for (const rank of ranks) record.ranks.add(rank);
      for (const path of paths) record.paths.add(path);
      for (const tag of factTags) record.factTags.add(tag);
      const chapterEvidence = record.evidence.at(-1);
      if (chapterEvidence?.chapterId === chapter.id) {
        chapterEvidence.lastSourceLine = index + 1;
        chapterEvidence.mentionLines += 1;
        chapterEvidence.reasons.add(reason);
        for (const tag of factTags) chapterEvidence.factTags.add(tag);
      } else {
        record.evidence.push({
          chapterId: chapter.id,
          volume: chapter.volume,
          section: chapter.section,
          firstSourceLine: index + 1,
          lastSourceLine: index + 1,
          mentionLines: 1,
          reasons: new Set([reason]),
          factTags: new Set(factTags)
        });
      }
      if (reason === "explicit") record.confidence = "high";
      records.set(name, record);
    }
  }

  return [...records.values()]
    .map((record) => ({
      ...record,
      ranks: [...record.ranks].sort((a, b) => a - b),
      paths: [...record.paths].sort(compareText),
      factTags: [...record.factTags],
      evidence: record.evidence.map((evidence) => ({
        ...evidence,
        reasons: [...evidence.reasons],
        factTags: [...evidence.factTags]
      }))
    }))
    .sort((a, b) => compareText(a.name, b.name));
}

export function extractSeededEntityMentions(corpus, entries) {
  const chapterById = new Map(corpus.chapters.map((chapter) => [chapter.id, chapter]));
  const records = entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    aliases: [...new Set(entry.aliases ?? [])],
    mentionCount: 0,
    matchedAliases: new Set(),
    evidence: []
  }));

  for (let index = 0; index < corpus.lines.length; index += 1) {
    const line = corpus.lines[index];
    const chapter = chapterById.get(corpus.lineChapterIds[index]);
    if (!chapter) continue;

    for (const record of records) {
      const matched = [];
      for (const alias of [record.name, ...record.aliases]) {
        const count = countOccurrences(line, alias);
        if (!count) continue;
        record.mentionCount += count;
        record.matchedAliases.add(alias);
        matched.push(alias);
      }
      if (!matched.length) continue;

      const factTags = FACT_TAG_RULES.filter(([, pattern]) => pattern.test(line)).map(
        ([tag]) => tag
      );
      const chapterEvidence = record.evidence.at(-1);
      if (chapterEvidence?.chapterId === chapter.id) {
        chapterEvidence.lastSourceLine = index + 1;
        chapterEvidence.mentionCount += matched.reduce(
          (count, alias) => count + countOccurrences(line, alias),
          0
        );
        for (const alias of matched) chapterEvidence.matched.add(alias);
        for (const tag of factTags) chapterEvidence.factTags.add(tag);
      } else {
        record.evidence.push({
          chapterId: chapter.id,
          volume: chapter.volume,
          section: chapter.section,
          firstSourceLine: index + 1,
          lastSourceLine: index + 1,
          mentionCount: matched.reduce(
            (count, alias) => count + countOccurrences(line, alias),
            0
          ),
          matched: new Set(matched),
          factTags: new Set(factTags)
        });
      }
    }
  }

  return records
    .filter((record) => record.mentionCount > 0)
    .map((record) => ({
      ...record,
      matchedAliases: [record.name, ...record.aliases].filter((alias) =>
        record.matchedAliases.has(alias)
      ),
      evidence: record.evidence.map((evidence) => ({
        ...evidence,
        matched: [...evidence.matched],
        factTags: [...evidence.factTags]
      }))
    }))
    .sort((a, b) => a.id.localeCompare(b.id, "en"));
}

export function buildSourceManifest({ sourceBytes, fileName, encoding, corpus }) {
  const sha256 = hash(sourceBytes);
  const hasGaps = corpus.volumes.some((volume) => volume.missingRanges.length > 0);

  return {
    schemaVersion: 1,
    source: {
      fileName,
      sha256,
      sizeBytes: sourceBytes.byteLength,
      encoding,
      lineCount: corpus.lineCount,
      headingCount: corpus.chapters.length,
      volumeCount: corpus.volumes.length,
      coverageStatus: hasGaps ? "incomplete" : "complete"
    },
    volumes: corpus.volumes
  };
}

export function buildChapterIndex(corpus, sourceSha256) {
  return {
    schemaVersion: 1,
    sourceSha256,
    chapters: corpus.chapters.map((chapter) => ({
      id: chapter.id,
      volume: chapter.volume,
      section: chapter.section,
      sourceSection: chapter.sourceSection,
      sectionCorrection: chapter.sectionCorrection,
      sourceLine: chapter.sourceLine,
      titleHash: hash(Buffer.from(chapter.title, "utf8")).slice(0, 16)
    }))
  };
}

function summarizeVolumes(chapters) {
  const byVolume = new Map();
  for (const chapter of chapters) {
    const volumeChapters = byVolume.get(chapter.volume) ?? [];
    volumeChapters.push(chapter);
    byVolume.set(chapter.volume, volumeChapters);
  }

  return [...byVolume.entries()].map(([volume, volumeChapters]) => {
    const sections = [...new Set(volumeChapters.map((chapter) => chapter.section))].sort(
      (a, b) => a - b
    );
    const firstSection = sections[0];
    const lastSection = sections.at(-1);
    const missing = [];
    for (let section = 1; section <= lastSection; section += 1) {
      if (!sections.includes(section)) missing.push(section);
    }

    return {
      volume,
      headingCount: volumeChapters.length,
      firstSection,
      lastSection,
      missingRanges: compressNumberRanges(missing)
    };
  });
}

function compressNumberRanges(numbers) {
  if (!numbers.length) return [];
  const ranges = [];
  let from = numbers[0];
  let to = numbers[0];

  for (const number of numbers.slice(1)) {
    if (number === to + 1) {
      to = number;
      continue;
    }
    ranges.push({ from, to });
    from = number;
    to = number;
  }
  ranges.push({ from, to });
  return ranges;
}

function extractSignalNames(line) {
  const names = new Set();
  const pattern =
    /(?:名为|叫做|称为|唤作|命名为|取名为)[\s—\-“”"'「」『』]*([\p{Script=Han}]{1,12}?)(?=[，。；！？、\s“”"'「」『』]|$)/gu;

  for (const match of line.matchAll(pattern)) {
    const candidate = normalizeName(match[1]);
    const subjectContext = line.slice(Math.max(0, match.index - 24), match.index);
    const hasGuSubject =
      /此蛊|该蛊|这只蛊|那只蛊|一只|两只|三只|仙蛊|凡蛊|蛊虫|此虫|该虫/u.test(
        subjectContext
      );
    const hasPersonSubject = /此人|此女|此老|说话的|此仙|蛊仙/u.test(subjectContext);
    if (
      (candidate.endsWith("蛊") || (hasGuSubject && !hasPersonSubject)) &&
      isPlausibleGuName(candidate, line, match.index)
    ) {
      names.add(candidate);
    }
  }
  return names;
}

function extractGuSuffixNames(line) {
  const names = new Set();
  const actionPattern =
    /(?:命名为|取名为|称之为|称为|叫做|唤作|名为|炼制出|炼成|炼制|催动|狂催|催发|动用|使用|拥有|获得|得到|取得|掌握|失去|借来|换取|收取|捕获|持有|舍弃|拿出|取出|收起|撤销|撤掉|撑起|顶起|发动|激活|祭出|喂养|升炼|依靠|借助|通过|问及|提到|盛产|产出|乃是|便是|就是|一只|两只|三只|这只|那只|此只)(?:了|掉|出|着|起|的|一只|这只|那只)?(?:[零〇一二两三四五六七八九十百千万\d]+转)?(?:的)?(?:仙级|凡级|仙道|凡道)?\s*([\p{Script=Han}]{1,8}?(?:仙)?蛊)(?=$|[，。；！？、：:“”"'「」『』\s]|的|是|乃|能|可|会|便|就|和|与|及)/gu;
  const rankedPossessionPattern =
    /(?:有|存有|藏有|备有)(?:一只|两只|三只)?(?:[零〇一二两三四五六七八九十百千万\d]+转)(?:的)?(?:仙级|凡级|仙道|凡道)?\s*([\p{Script=Han}]{1,8}?(?:仙)?蛊)(?=$|[，。；！？、：:“”"'「」『』\s]|的|是|乃|能|可|会|便|就|和|与|及)/gu;
  const listPattern =
    /(?:和|与|及|、)([\p{Script=Han}]{1,8}?(?:仙)?蛊)(?=$|[，。；！？、：:“”"'「」『』\s]|的|是|乃|能|可|会|便|就|和|与|及)/gu;
  const boundaryPattern =
    /(?:^|[，。；！？、：:“”"'「」『』\s])([\p{Script=Han}]{1,18}?蛊)(?!虫|师|仙|方|阵|屋|材|道|界|术)/gu;

  for (const pattern of [actionPattern, rankedPossessionPattern, listPattern, boundaryPattern]) {
    for (const match of line.matchAll(pattern)) {
      const candidate = trimDirectGuCandidate(match[1]);
      if (isPlausibleGuName(candidate, line, match.index)) names.add(candidate);
    }
  }
  return names;
}

function normalizeName(value) {
  return value
    .replace(/^[的得地了着将把被与和及或其又再正但而也都还可会能要若如]+/u, "")
    .replace(/[的得地了着]+$/u, "")
    .trim();
}

function trimDirectGuCandidate(value) {
  let candidate = normalizeName(value);
  const markers = [
    ...GU_NAME_ACTION_FRAGMENTS,
    "但是",
    "而且",
    "所以",
    "因此",
    "原来",
    "不过",
    "只是",
    "有一只",
    "有两只",
    "有三只",
    "有只",
    "一只只",
    "一只",
    "两只",
    "三只",
    "一颗",
    "两颗",
    "三颗",
    "一枚",
    "两枚",
    "三枚",
    "的"
  ];
  let cutAt = -1;
  for (const marker of markers) {
    const index = candidate.lastIndexOf(marker);
    if (index >= 0) cutAt = Math.max(cutAt, index + marker.length);
  }
  if (cutAt >= 0) candidate = candidate.slice(cutAt);
  candidate = normalizeName(candidate);

  candidate = candidate
    .replace(/^.*有(?=[零〇一二两三四五六七八九十百千万\d]+转)/u, "")
    .replace(
      /^(?:半|[零〇一二两三四五六七八九十百千万\d]+)(?:只|颗|枚|种|套|份|道|条|头|群)/u,
      ""
    )
    .replace(/^[零〇一二两三四五六七八九十百千万\d]+转(?:层次)?(?:的)?/u, "")
    .replace(/^(?:仙级|凡级)/u, "");
  return normalizeName(candidate);
}

function isPlausibleGuName(candidate, line, matchIndex) {
  if (!candidate || candidate.length < 2 || candidate.length > 12) return false;
  if (GENERIC_GU_TERMS.has(candidate)) return false;
  if (GU_NAME_ACTION_FRAGMENTS.some((fragment) => candidate.includes(fragment))) return false;
  if (/^[\p{Script=Han}]{1,6}道(?:仙|凡)?蛊$/u.test(candidate)) return false;
  if (/^(炼|养|用|种|换|解|控|催|御|收|取|此|该|一|仙|凡)+蛊$/u.test(candidate)) {
    return false;
  }

  if (candidate.endsWith("蛊")) return true;
  const contextStart = Math.max(0, matchIndex - 16);
  const contextEnd = Math.min(line.length, matchIndex + candidate.length + 24);
  const context = line.slice(contextStart, contextEnd);
  return /此蛊|该蛊|仙蛊|凡蛊|蛊虫/u.test(context);
}

function extractRanksNearName(line, name) {
  const index = line.indexOf(name);
  if (index < 0) return [];
  const context = line.slice(Math.max(0, index - 18), Math.min(line.length, index + name.length + 18));
  const ranks = new Set();
  for (const match of context.matchAll(/([零〇一二两三四五六七八九十\d]+)转/gu)) {
    const rank = parseChineseNumber(match[1]);
    if (rank >= 1 && rank <= 9) ranks.add(rank);
  }
  return [...ranks];
}

function chapterId(volume, section) {
  return `v${String(volume).padStart(2, "0")}-s${String(section).padStart(3, "0")}`;
}

function compareText(left, right) {
  return left.localeCompare(right, "zh-CN");
}

function matchHeading(line) {
  return line.match(
    /^第([零〇一二两三四五六七八九十百千万\d]+)节(?:[：:]\s*)?(.*)$/
  );
}

function findNextHeadingSection(lines, fromIndex) {
  for (let index = fromIndex; index < lines.length; index += 1) {
    const match = matchHeading(lines[index]);
    if (match) return parseChineseNumber(match[1]);
  }
  return null;
}

function countOccurrences(text, value) {
  if (!value) return 0;
  let count = 0;
  let from = 0;
  while (from < text.length) {
    const index = text.indexOf(value, from);
    if (index < 0) break;
    count += 1;
    from = index + value.length;
  }
  return count;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
