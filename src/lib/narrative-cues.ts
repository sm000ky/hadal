import { NarrativeCue } from './types';

export const NARRATION_TOTAL_DURATION = 69.97;

export const NARRATIVE_CUES: NarrativeCue[] = [
  {
    id: 1,
    start: 0.0,
    end: 5.0,
    depthMeters: 180,
    pressureAtm: 19.0,
    tempC: 22.4,
    zone: 'EPIPELAGIC',
    en: "Now, however, we are developing technology that can take us to places...",
    id_id: "Kini, bagaimanapun juga, kita tengah mengembangkan teknologi yang mampu membawa kita ke tempat-tempat...",
    ja: "しかし今、私たちは人類を未知の領域へと導く技術を開発している…"
  },
  {
    id: 2,
    start: 5.0,
    end: 14.0,
    depthMeters: 950,
    pressureAtm: 96.0,
    tempC: 6.8,
    zone: 'MESOPELAGIC',
    en: "...where the ocean is ten times deeper.",
    id_id: "...di mana samudra terbentang sepuluh kali lipat lebih dalam.",
    ja: "…海が十倍もの深さを湛える、その深淵へ。"
  },
  {
    id: 3,
    start: 14.0,
    end: 25.5,
    depthMeters: 3200,
    pressureAtm: 321.0,
    tempC: 3.2,
    zone: 'BATHYPELAGIC',
    en: "An international team of scientists is setting out to discover what, if anything, lives at these much greater depths.",
    id_id: "Sebuah tim ilmuwan internasional bertolak untuk mengungkap makhluk apa—jika memang ada—yang sanggup bertahan di kedalaman yang jauh lebih ekstrem ini.",
    ja: "国際的な科学者チームが、この遥かなる深海に果たして生命が息づいているのかを解き明かすべく挑む。"
  },
  {
    id: 4,
    start: 25.5,
    end: 31.2,
    depthMeters: 5800,
    pressureAtm: 581.0,
    tempC: 1.8,
    zone: 'ABYSSOPELAGIC',
    en: "Down there, the water pressure can be a thousand times that at the surface...",
    id_id: "Di bawah sana, tekanan air membengkak hingga seribu kali lipat tekanan di permukaan bumi...",
    ja: "そこでは、水圧は地表の千倍にも達し…"
  },
  {
    id: 5,
    start: 31.2,
    end: 38.2,
    depthMeters: 7400,
    pressureAtm: 741.0,
    tempC: 1.5,
    zone: 'HADALPELAGIC',
    en: "...and there is little food.",
    id_id: "...dan nyaris tiada sumber makanan.",
    ja: "…そして、糧となるものは極めて乏しい。"
  },
  {
    id: 6,
    start: 38.2,
    end: 48.0,
    depthMeters: 9200,
    pressureAtm: 921.0,
    tempC: 1.4,
    zone: 'HADALPELAGIC',
    en: "Until recently, many scientists assumed that such waters must be barren. How could any creature survive in such conditions?",
    id_id: "Hingga baru-baru ini, banyak ilmuwan menduga perairan ini pastilah tandus dan mati. Bagaimana mungkin ada makhluk hidup yang mampu bertahan dalam kondisi sedahsyat itu?",
    ja: "近年まで、多くの科学者はこの海が不毛の死の世界だと考えていた。これほどの極限状態で、いかにして生命が存在し得るというのか？"
  },
  {
    id: 7,
    start: 48.0,
    end: 60.0,
    depthMeters: 10600,
    pressureAtm: 1061.0,
    tempC: 1.3,
    zone: 'HADALPELAGIC',
    en: "We now know that there is life down there, but we still know very little about it.",
    id_id: "Kini kita tahu bahwa kehidupan memang ada di bawah sana, namun pemahaman kita tentangnya masih teramat sedikit.",
    ja: "今や私たちはそこに生命が存在することを知っているが、その実態については未だほとんど何も知らない。"
  },
  {
    id: 8,
    start: 60.0,
    end: 69.97,
    depthMeters: 10994,
    pressureAtm: 1086.0,
    tempC: 1.2,
    zone: 'HADALPELAGIC',
    en: "This is an expedition to explore the Earth's deepest frontier.",
    id_id: "Inilah ekspedisi untuk menjelajah garis perbatasan terdalam planet Bumi.",
    ja: "これは、母なる地球の最も深きフロンティアへと挑む探求の旅である。"
  }
];

export function getActiveCue(currentTime: number): NarrativeCue | null {
  return NARRATIVE_CUES.find(cue => currentTime >= cue.start && currentTime <= cue.end) || null;
}
