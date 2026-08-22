import type { DemoChapterDefinition } from "../types";

export const A_NEW_FRIEND_CHAPTERS: DemoChapterDefinition[] = [
  {
    slug: "first-hello",
    titleEn: "First Hello",
    titleVi: "Lời chào đầu tiên",
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
      { word: "quiet", lemma: "quiet", ipa: "/ˈkwaɪət/", partOfSpeech: "adj.", meaningVi: "yên tĩnh" },
      { word: "forest", lemma: "forest", ipa: "/ˈfɒrɪst/", partOfSpeech: "n.", meaningVi: "khu rừng" },
      { word: "soft", lemma: "soft", ipa: "/sɒft/", partOfSpeech: "adj.", meaningVi: "mềm mại, nhẹ nhàng" },
      { word: "fly", lemma: "fly", ipa: "/flaɪ/", partOfSpeech: "v.", meaningVi: "bay" },
      { word: "den", lemma: "den", ipa: "/den/", partOfSpeech: "n.", meaningVi: "hang, tổ ấm" },
    ],
  },
  {
    slug: "in-the-forest",
    titleEn: "In the Forest",
    titleVi: "Trong khu rừng",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "The next day, Sora and Blu walked deeper into the forest.",
          "Sunlight came through the leaves like golden coins on the path.",
        ],
        viSentences: [
          "Ngày hôm sau, Sora và Blu đi sâu hơn vào khu rừng.",
          "Ánh nắng xuyên qua tán lá như những đồng xu vàng trên lối mòn.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Look!\" Blu whispered. \"A stream!\"",
          "Sora nodded. \"We can drink here and rest for a while.\"",
        ],
        viSentences: [
          "\"Nhìn kìa!\" Blu thì thầm. \"Có một con suối!\"",
          "Sora gật đầu. \"Chúng mình có thể uống nước và nghỉ một lát ở đây.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "They sat by the cool water and listened to frogs singing.",
          "Blu felt less afraid because Sora stayed close.",
        ],
        viSentences: [
          "Hai bạn ngồi bên dòng nước mát và lắng nghe tiếng ếch ca.",
          "Blu bớt sợ hơn vì Sora luôn ở bên cạnh.",
        ],
      },
    ],
    featured: [
      { word: "stream", lemma: "stream", ipa: "/striːm/", partOfSpeech: "n.", meaningVi: "dòng suối" },
      { word: "path", lemma: "path", ipa: "/pɑːθ/", partOfSpeech: "n.", meaningVi: "lối đi" },
    ],
  },
  {
    slug: "a-scared-bird",
    titleEn: "A Scared Bird",
    titleVi: "Chú chim sợ hãi",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "A loud crack made Blu jump.",
          "A branch had fallen not far from their den.",
        ],
        viSentences: [
          "Một tiếng nứt lớn khiến Blu giật mình.",
          "Một cành cây vừa rơi xuống không xa chỗ hang của hai bạn.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"I'm scared,\" Blu said, hiding behind Sora's tail.",
          "Sora spoke softly, \"It's okay. The forest is loud sometimes, but we are safe together.\"",
        ],
        viSentences: [
          "\"Tớ sợ quá,\" Blu nói và trốn sau đuôi Sora.",
          "Sora nói nhẹ nhàng, \"Không sao đâu. Rừng đôi khi ồn ào, nhưng có nhau thì chúng mình an toàn.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "Blu took a deep breath and peeked out again.",
          "Soon they were laughing at a squirrel who stole an acorn.",
        ],
        viSentences: [
          "Blu hít một hơi thật sâu rồi nhìn ra ngoài lại.",
          "Chẳng bao lâu, hai bạn cười với một chú sóc đang giật một quả đốm.",
        ],
      },
    ],
  },
  {
    slug: "berries-and-leaves",
    titleEn: "Berries and Leaves",
    titleVi: "Quả mọng và lá cây",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "Summer brought sweet berries to the forest floor.",
          "Sora picked the red ones and gave the blue ones to Blu.",
        ],
        viSentences: [
          "Mùa hè mang những quả mọng ngọt đến sàn rừng.",
          "Sora hái quả đỏ và đưa quả xanh cho Blu.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Try this,\" Sora said. \"It's juicy!\"",
          "Blu chirped happily, \"Best snack ever!\"",
        ],
        viSentences: [
          "\"Thử quả này đi,\" Sora nói. \"Nó mọng nước lắm!\"",
          "Blu líu lo vui vẻ, \"Món ngon nhất đời!\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "They made crowns from soft leaves and wore them all afternoon.",
          "When the sun set, they shared the last berry under the stars.",
        ],
        viSentences: [
          "Hai bạn làm vương miện từ lá mềm và đội cả buổi chiều.",
          "Khi mặt trời lặn, họ chia quả mọng cuối cùng dưới bầu trời đầy sao.",
        ],
      },
    ],
  },
  {
    slug: "starry-night",
    titleEn: "Starry Night",
    titleVi: "Đêm đầy sao",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "That night the sky was full of stars.",
          "Sora and Blu lay on the hill and counted them until they lost track.",
        ],
        viSentences: [
          "Đêm đó bầu trời đầy sao.",
          "Sora và Blu nằm trên đồi và đếm sao đến khi không nhớ nữa.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Which star is yours?\" Blu asked.",
          "Sora pointed to a bright one. \"Maybe that one — it keeps us company.\"",
        ],
        viSentences: [
          "\"Ngôi sao nào là của cậu?\" Blu hỏi.",
          "Sora chỉ vào một ngôi sáng. \"Có lẽ là ngôi đó — nó ở bên chúng mình.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "A gentle wind wrapped around them like a blanket.",
          "They fell asleep knowing tomorrow would bring a new adventure.",
        ],
        viSentences: [
          "Một làn gió nhẹ quấn quanh họ như chiếc chăn.",
          "Hai bạn chìm vào giấc ngủ, biết rằng ngày mai sẽ có một cuộc phiêu lưu mới.",
        ],
      },
    ],
  },
  {
    slug: "rainy-day",
    titleEn: "Rainy Day",
    titleVi: "Ngày mưa",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "Rain tapped on the leaves all morning.",
          "Sora and Blu stayed inside the den and told stories.",
        ],
        viSentences: [
          "Mưa gõ lên lá cả buổi sáng.",
          "Sora và Blu ở trong hang và kể chuyện cho nhau.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"I want to fly in the rain,\" Blu sighed.",
          "Sora grinned. \"First let's practice from this low branch when the sky clears.\"",
        ],
        viSentences: [
          "\"Tớ muốn bay trong mưa,\" Blu thở dài.",
          "Sora cười. \"Trước hết, khi trời tạnh, mình luyện từ cành thấp này đã.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "When the clouds parted, a rainbow arched over the forest.",
          "Blu flapped once, twice — and lifted off for a short, wobbly flight.",
        ],
        viSentences: [
          "Khi mây tan, một cầu vồng vắt ngang khu rừng.",
          "Blu vỗ cánh một lần, hai lần — rồi bay lên thật ngắn và hơi chao.",
        ],
      },
    ],
  },
  {
    slug: "the-big-tree",
    titleEn: "The Big Tree",
    titleVi: "Cây to",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "At the heart of the forest stood the biggest tree anyone had seen.",
          "Its roots were wide enough for Sora to walk on like a bridge.",
        ],
        viSentences: [
          "Ở trung tâm khu rừng có cây to nhất mà ai cũng từng thấy.",
          "Rễ cây rộng đến mức Sora có thể đi như trên cây cầu.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Can we climb it?\" Blu asked.",
          "\"Slowly,\" Sora said. \"Friends climb together.\"",
        ],
        viSentences: [
          "\"Mình leo lên được không?\" Blu hỏi.",
          "\"Từ từ thôi,\" Sora nói. \"Bạn bè leo cùng nhau mà.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "From the top they saw the whole valley and their little hill.",
          "Blu sang a new song that echoed through the branches.",
        ],
        viSentences: [
          "Từ trên cao, hai bạn nhìn thấy cả thung lũng và ngọn đồi nhỏ của mình.",
          "Blu hát một bài mới vang vọng qua các cành cây.",
        ],
      },
    ],
  },
  {
    slug: "lost-and-found",
    titleEn: "Lost and Found",
    titleVi: "Lạc và tìm thấy",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "While chasing a butterfly, Blu flew too far and could not see Sora.",
          "The forest felt big and strange without his friend.",
        ],
        viSentences: [
          "Khi đuổi theo một con bướm, Blu bay quá xa và không thấy Sora.",
          "Khu rừng trông thật rộng và lạ lẫm khi không có bạn bên cạnh.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Sora!\" Blu called again and again.",
          "From far away came a familiar voice, \"I'm here — follow my whistle!\"",
        ],
        viSentences: [
          "\"Sora!\" Blu gọi đi gọi lại.",
          "Từ xa vọng lại giọng quen thuộc, \"Tớ đây — theo tiếng huýt sáo của tớ!\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "They ran into each other's arms beside the big tree.",
          "Sora had tied a ribbon on a branch so Blu would find the way home.",
        ],
        viSentences: [
          "Hai bạn ôm nhau bên cạnh cây to.",
          "Sora đã buộc một dải ruy băng lên cành cây để Blu tìm đường về.",
        ],
      },
    ],
  },
  {
    slug: "a-new-song",
    titleEn: "A New Song",
    titleVi: "Bài hát mới",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "Blu wanted to thank Sora for finding him.",
          "He practiced a melody every dawn until it sounded just right.",
        ],
        viSentences: [
          "Blu muốn cảm ơn Sora vì đã tìm thấy mình.",
          "Cậu luyện một giai điệu mỗi bình minh cho đến khi nghe thật hay.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Listen,\" Blu said proudly.",
          "Sora closed his eyes and smiled, \"That's the happiest song in the forest.\"",
        ],
        viSentences: [
          "\"Nghe này,\" Blu nói đầy tự hào.",
          "Sora nhắm mắt và mỉm cười, \"Đó là bài hát vui nhất trong rừng.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "Other animals gathered to hear the music.",
          "From that day, the hill was never quiet for long — and that was a good thing.",
        ],
        viSentences: [
          "Các con vật khác tụ lại để nghe.",
          "Từ đó, ngọn đồi không bao giờ yên lặng lâu — và đó là điều tuyệt vời.",
        ],
      },
    ],
  },
  {
    slug: "winter-winds",
    titleEn: "Winter Winds",
    titleVi: "Gió mùa đông",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "Cold winds came, and the forest turned silver with frost.",
          "Sora lined the den with dry moss and shared his warm tail with Blu.",
        ],
        viSentences: [
          "Gió lạnh thổi về, khu rừng phủ một màu bạc của sương giá.",
          "Sora lót rêu khô trong hang và cho Blu sưởi bên đuôi ấm của mình.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Will spring come back?\" Blu asked.",
          "Sora nodded. \"Friends wait together, and seasons always turn.\"",
        ],
        viSentences: [
          "\"Mùa xuân sẽ quay lại chứ?\" Blu hỏi.",
          "Sora gật đầu. \"Bạn bè cùng chờ, và mùa luôn đổi thay.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "They drank hot berry tea and read the stars through a small hole in the roof.",
          "Winter was long, but never lonely.",
        ],
        viSentences: [
          "Hai bạn uống trà quả mọng nóng và ngắm sao qua lỗ nhỏ trên mái hang.",
          "Mùa đông dài, nhưng không bao giờ cô đơn.",
        ],
      },
    ],
  },
  {
    slug: "spring-returns",
    titleEn: "Spring Returns",
    titleVi: "Mùa xuân trở lại",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "Snow melted into tiny streams, and green shoots pushed through the soil.",
          "Blu flew loops in the warm air while Sora stretched in the sun.",
        ],
        viSentences: [
          "Tuyết tan thành những dòng suối nhỏ, mầm xanh đâm lên khỏi đất.",
          "Blu bay vòng trong không khí ấm còn Sora duỗi người dưới nắng.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"Look how far I can fly now!\" Blu cheered.",
          "Sora laughed, \"You learned because you never gave up.\"",
        ],
        viSentences: [
          "\"Nhìn tớ bay xa thế này nè!\" Blu reo lên.",
          "Sora cười, \"Cậu học được vì cậu không bỏ cuộc.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "Flowers opened along the path they walked on the first day they met.",
          "The forest felt like a gift they opened together every morning.",
        ],
        viSentences: [
          "Hoa nở dọc lối mà hai bạn đi vào ngày đầu gặp nhau.",
          "Khu rừng như món quà họ cùng mở mỗi sáng.",
        ],
      },
    ],
  },
  {
    slug: "best-friends",
    titleEn: "Best Friends",
    titleVi: "Bạn thân",
    units: [
      {
        type: "paragraph",
        enSentences: [
          "One year after their first hello, Sora and Blu sat on the hill again.",
          "The stars looked the same, but everything felt warmer.",
        ],
        viSentences: [
          "Một năm sau lời chào đầu tiên, Sora và Blu lại ngồi trên đồi.",
          "Các vì sao vẫn như xưa, nhưng mọi thứ ấm áp hơn.",
        ],
      },
      {
        type: "dialogue",
        enSentences: [
          "\"I'm glad I was scared that day,\" Blu said.",
          "Sora replied, \"Me too — scared birds make brave friends.\"",
        ],
        viSentences: [
          "\"Tớ mừng vì hôm đó tớ đã sợ,\" Blu nói.",
          "Sora đáp, \"Tớ cũng vậy — chim nhỏ hay sợ thì mới thành bạn dũng cảm.\"",
        ],
      },
      {
        type: "paragraph",
        enSentences: [
          "They promised to share every season, every song, and every quiet starry night.",
          "And on that hill, friendship was the brightest light of all.",
        ],
        viSentences: [
          "Hai bạn hứa sẽ chia sẻ mọi mùa, mọi bài hát và mọi đêm sao yên bình.",
          "Và trên ngọn đồi ấy, tình bạn là ánh sáng rực rỡ nhất.",
        ],
      },
    ],
  },
];
