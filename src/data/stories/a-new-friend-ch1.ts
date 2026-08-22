export type ContentUnitType = "paragraph" | "dialogue" | "heading" | "quote";

export type FeaturedVocab = {
  word: string;
  lemma: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  orderNo: number;
};

export type DemoChapterUnit = {
  type: ContentUnitType;
  enSentences: string[];
  viSentences: string[];
};

export const A_NEW_FRIEND_CH1: {
  units: DemoChapterUnit[];
  featured: FeaturedVocab[];
} = {
  units: [
    {
      type: "paragraph",
      enSentences: [
        "On a quiet hill at the edge of the forest, lived a little fox named Sora.",
        "Sora loved to watch the stars at night and listen to the wind singing through the trees.",
      ],
      viSentences: [
        "Trên một ngọn đồi yên tĩnh ở rìa khu rừng, có một chú cáo nhỏ tên là Sora.",
        "Sora rất thích ngắm sao vào ban đêm và lắng nghe gió hát qua những tán cây.",
      ],
    },
    {
      type: "paragraph",
      enSentences: [
        "One morning, Sora heard a soft sound coming from a bush.",
        "It was a small bird with a blue wing.",
      ],
      viSentences: [
        "Một buổi sáng, Sora nghe thấy một âm thanh nhẹ nhàng phát ra từ bụi cây.",
        "Đó là một chú chim nhỏ với đôi cánh màu xanh.",
      ],
    },
    {
      type: "dialogue",
      enSentences: [
        "\"Hello!\" said Sora gently. \"What's your name?\"",
        "The bird was shy, but it chirped back, \"I'm Blu. I don't know how to fly very well.\"",
      ],
      viSentences: [
        "\"Xin chào!\" Sora nhẹ giọng nói. \"Bạn tên là gì?\"",
        "Chú chim hơi rụt rè, nhưng nó líu lo đáp lại, \"Tớ là Blu. Tớ chưa biết bay giỏi lắm.\"",
      ],
    },
    {
      type: "paragraph",
      enSentences: [
        "Sora smiled. \"Let's be friends.\"",
        "From that day, they played together, explored the forest, and built a cozy den under the big tree.",
      ],
      viSentences: [
        "Sora mỉm cười. \"Chúng mình làm bạn nhé.\"",
        "Từ ngày đó, họ cùng nhau chơi đùa, khám phá khu rừng và xây một cái hang nhỏ ấm áp dưới gốc cây lớn.",
      ],
    },
  ],
  featured: [
    {
      word: "quiet",
      lemma: "quiet",
      ipa: "/ˈkwaɪət/",
      partOfSpeech: "adj.",
      meaningVi: "yên tĩnh",
      orderNo: 1,
    },
    {
      word: "forest",
      lemma: "forest",
      ipa: "/ˈfɒrɪst/",
      partOfSpeech: "n.",
      meaningVi: "khu rừng",
      orderNo: 2,
    },
    {
      word: "soft",
      lemma: "soft",
      ipa: "/sɒft/",
      partOfSpeech: "adj.",
      meaningVi: "mềm mại, nhẹ nhàng",
      orderNo: 3,
    },
    {
      word: "fly",
      lemma: "fly",
      ipa: "/flaɪ/",
      partOfSpeech: "v.",
      meaningVi: "bay",
      orderNo: 4,
    },
    {
      word: "den",
      lemma: "den",
      ipa: "/den/",
      partOfSpeech: "n.",
      meaningVi: "hang, tổ ấm",
      orderNo: 5,
    },
  ],
};
