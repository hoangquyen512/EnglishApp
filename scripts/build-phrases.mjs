import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src/data/banks')
mkdirSync(outDir, { recursive: true })

const IPA = {
  a: 'ə',
  am: 'æm',
  an: 'ən',
  and: 'ənd',
  are: 'ɑː',
  at: 'æt',
  can: 'kæn',
  could: 'kʊd',
  do: 'duː',
  does: 'dʌz',
  for: 'fɔː',
  from: 'frəm',
  have: 'hæv',
  hello: 'həˈləʊ',
  hi: 'haɪ',
  how: 'haʊ',
  i: 'aɪ',
  in: 'ɪn',
  is: 'ɪz',
  it: 'ɪt',
  me: 'miː',
  my: 'maɪ',
  no: 'nəʊ',
  not: 'nɒt',
  of: 'əv',
  please: 'pliːz',
  sorry: 'ˈsɒri',
  thank: 'θæŋk',
  thanks: 'θæŋks',
  that: 'ðæt',
  the: 'ðə',
  this: 'ðɪs',
  to: 'tə',
  we: 'wiː',
  what: 'wɒt',
  where: 'weə',
  would: 'wʊd',
  yes: 'jes',
  you: 'juː',
  your: 'jɔː',
}

function ipaOf(en) {
  const words = en
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return `/${words.map((word) => IPA[word] || word).join(' ')}/`
}

const TIMES = [
  { en: 'This morning', vi: 'Sáng nay' },
  { en: 'This afternoon', vi: 'Chiều nay' },
  { en: 'This evening', vi: 'Tối nay' },
  { en: 'Today', vi: 'Hôm nay' },
  { en: 'Tomorrow', vi: 'Ngày mai' },
  { en: 'Tonight', vi: 'Tối nay' },
  { en: 'Now', vi: 'Bây giờ' },
]

const HAS_TIME =
  /today|tomorrow|tonight|morning|afternoon|evening|\bnow\b|weekend|\bweeks?\b|monday|tuesday|wednesday|thursday|friday|saturday|sunday|yesterday|later|soon|a\.m\.|p\.m\.|\bnoon\b/i

const TIMEABLE =
  /^(Can|Could|May|Would|Do |Does |Is |Are |What |Where |Which |How |When |Have |Has |I would like|I will|I need|I have a |I have had |I have lost |Please |Excuse me|Let us|Nice to meet)/i

const PROPER_LEAD = /^(Anna|Minh|Linh|Hoa|Nam|Lan|Khoa|Trang|Mai|Hung|Nguyen|Tran|Le|Pham|Hoang|Vietnam|Bamboo|Vietjet|Emirates|Singapore|Korean|Japan|Qatar|Thai|ANA)\b/

function softenEn(en) {
  if (/^I\b/.test(en) || PROPER_LEAD.test(en)) return en
  return en[0].toLowerCase() + en.slice(1)
}

function softenVi(vi) {
  if (PROPER_LEAD.test(vi)) return vi
  return vi[0].toLowerCase() + vi.slice(1)
}

function withTimes(rows) {
  const extra = []
  for (const row of rows) {
    if (HAS_TIME.test(row.en) || !TIMEABLE.test(row.en)) continue
    for (const time of TIMES) {
      extra.push({
        en: `${time.en}, ${softenEn(row.en)}`,
        vi: `${time.vi}, ${softenVi(row.vi)}`,
      })
    }
  }
  return extra
}

function withPolite(rows) {
  return rows.flatMap((row) => {
    const next = [row]
    if (/^(Can|Could|May|Would|Do|Is|Are)/.test(row.en) && !/please/i.test(row.en)) {
      next.push({
        en: row.en.replace(/\?$/, ', please?'),
        vi: row.vi.replace(/\?$/, ' ạ?'),
      })
    }
    return next
  })
}

function take(prefix, rows, note = '') {
  const seen = new Set()
  const phrases = []

  const push = (row) => {
    if (phrases.length === 1000) return
    const en = String(row.en || '')
      .replace(/\s+/g, ' ')
      .trim()
    const key = en.toLowerCase()
    if (!en || seen.has(key)) return
    seen.add(key)
    const vi = String(row.vi || '')
      .replace(/\s+/g, ' ')
      .trim()
    phrases.push({
      id: `${prefix}-${phrases.length + 1}`,
      en,
      vi: vi ? vi[0].toUpperCase() + vi.slice(1) : vi,
      ipa: row.ipa || ipaOf(en),
      note: row.note || note,
    })
  }

  for (const row of rows) push(row)
  for (const row of withPolite(rows)) push(row)
  for (const row of withTimes(rows)) push(row)
  for (const row of withPolite(withTimes(rows))) push(row)

  if (phrases.length !== 1000) {
    throw new Error(`${prefix}: only ${phrases.length} unique sentences`)
  }
  return phrases
}

function greetings() {
  const hello = [
    ['Hi', 'Chào'],
    ['Hello', 'Xin chào'],
    ['Hey', 'Chào'],
    ['Good morning', 'Chào buổi sáng'],
    ['Good afternoon', 'Chào buổi chiều'],
    ['Good evening', 'Chào buổi tối'],
    ['Hi there', 'Chào bạn'],
    ['Hello there', 'Xin chào bạn'],
    ['Hey there', 'Chào nhé'],
    ['Good to see you', 'Rất vui được gặp bạn'],
    ['Nice to see you', 'Vui được gặp bạn'],
    ['Great to see you', 'Thật vui được gặp bạn'],
  ]
  const how = [
    ['how are you', 'bạn thế nào'],
    ['how are you doing', 'bạn dạo này thế nào'],
    ['how have you been', 'dạo này bạn thế nào'],
    ['how is it going', 'mọi thứ thế nào'],
    ['how was your day', 'ngày của bạn thế nào'],
    ['are you okay', 'bạn ổn chứ'],
    ['are you busy', 'bạn có bận không'],
    ['is everything okay', 'mọi thứ ổn chứ'],
    ['how is your family', 'gia đình bạn thế nào'],
    ['what is new', 'có gì mới không'],
    ['how is work', 'công việc thế nào'],
    ['how is school', 'học hành thế nào'],
  ]
  const names = [
    'Linh',
    'Minh',
    'An',
    'Hoa',
    'Nam',
    'Lan',
    'Khoa',
    'Trang',
    'Hung',
    'Mai',
    'Tuan',
    'Vy',
    'Phuc',
    'Ngan',
    'Duy',
    'Ha',
    'Quang',
    'My',
    'Long',
    'Thu',
    'Kiet',
    'Ngoc',
    'Bao',
    'Yen',
  ]
  const places = [
    ['Vietnam', 'Việt Nam'],
    ['Hanoi', 'Hà Nội'],
    ['Ho Chi Minh City', 'Thành phố Hồ Chí Minh'],
    ['Da Nang', 'Đà Nẵng'],
    ['Hue', 'Huế'],
    ['Japan', 'Nhật Bản'],
    ['Korea', 'Hàn Quốc'],
    ['Thailand', 'Thái Lan'],
    ['Singapore', 'Singapore'],
    ['the United States', 'Hoa Kỳ'],
    ['England', 'Anh'],
    ['Australia', 'Úc'],
    ['Canada', 'Canada'],
    ['France', 'Pháp'],
    ['Germany', 'Đức'],
  ]
  const jobs = [
    ['a teacher', 'giáo viên'],
    ['a student', 'sinh viên'],
    ['an engineer', 'kỹ sư'],
    ['a doctor', 'bác sĩ'],
    ['a designer', 'nhà thiết kế'],
    ['a nurse', 'y tá'],
    ['a driver', 'tài xế'],
    ['a chef', 'đầu bếp'],
  ]
  const rows = [
    {
      en: 'Hi, how are you today?',
      vi: 'Chào bạn, hôm nay bạn thế nào?',
      ipa: '/haɪ haʊ ɑːr juː təˈdeɪ/',
    },
    { en: 'Nice to meet you.', vi: 'Rất vui được gặp bạn.', ipa: '/naɪs tə miːt juː/' },
    {
      en: 'My name is Linh. What is your name?',
      vi: 'Tôi tên Linh. Bạn tên gì?',
      ipa: '/maɪ neɪm ɪz lɪn wɒt ɪz jɔːr neɪm/',
    },
    { en: 'I am from Vietnam.', vi: 'Tôi đến từ Việt Nam.', ipa: '/aɪ æm frəm ˌvjetˈnæm/' },
    {
      en: 'Could you say that again, please?',
      vi: 'Bạn nói lại được không?',
      ipa: '/kʊd juː seɪ ðæt əˈɡen pliːz/',
    },
    {
      en: 'Sorry, I do not speak English very well.',
      vi: 'Xin lỗi, tôi nói tiếng Anh chưa giỏi.',
      ipa: '/ˈsɒri aɪ duː nɒt spiːk ˈɪŋɡlɪʃ ˈveri wel/',
    },
    {
      en: 'It was nice talking to you.',
      vi: 'Rất vui được nói chuyện với bạn.',
      ipa: '/ɪt wəz naɪs ˈtɔːkɪŋ tə juː/',
    },
    { en: 'See you later.', vi: 'Hẹn gặp lại.', ipa: '/siː juː ˈleɪtər/' },
  ]
  for (const [enH, viH] of hello) {
    for (const [enQ, viQ] of how) {
      rows.push({ en: `${enH}, ${enQ}?`, vi: `${viH}, ${viQ}?` })
    }
  }
  for (const name of names) {
    rows.push({ en: `My name is ${name}.`, vi: `Tôi tên ${name}.` })
    rows.push({ en: `I am ${name}. Nice to meet you.`, vi: `Tôi là ${name}. Rất vui được gặp bạn.` })
    rows.push({ en: `This is my friend ${name}.`, vi: `Đây là bạn tôi, ${name}.` })
    rows.push({ en: `Have you met ${name}?`, vi: `Bạn đã gặp ${name} chưa?` })
    rows.push({ en: `Please call me ${name}.`, vi: `Hãy gọi tôi là ${name}.` })
    rows.push({ en: `Nice to meet you, ${name}.`, vi: `Rất vui được gặp bạn, ${name}.` })
    rows.push({ en: `How do you know ${name}?`, vi: `Bạn quen ${name} thế nào?` })
    rows.push({ en: `Can I introduce you to ${name}?`, vi: `Tôi giới thiệu bạn với ${name} được không?` })
  }
  for (const [enP, viP] of places) {
    rows.push({ en: `I am from ${enP}.`, vi: `Tôi đến từ ${viP}.` })
    rows.push({ en: `I live in ${enP}.`, vi: `Tôi sống ở ${viP}.` })
    rows.push({ en: `I just arrived from ${enP}.`, vi: `Tôi vừa đến từ ${viP}.` })
    rows.push({ en: `Have you ever been to ${enP}?`, vi: `Bạn đã từng đến ${viP} chưa?` })
    rows.push({ en: `Are you from ${enP}?`, vi: `Bạn đến từ ${viP} phải không?` })
    rows.push({ en: `I work in ${enP}.`, vi: `Tôi làm việc ở ${viP}.` })
    rows.push({ en: `I am staying in ${enP}.`, vi: `Tôi đang ở ${viP}.` })
    rows.push({ en: `Do you live in ${enP}?`, vi: `Bạn sống ở ${viP} phải không?` })
  }
  for (const [enJ, viJ] of jobs) {
    rows.push({ en: `I am ${enJ}.`, vi: `Tôi là ${viJ}.` })
    rows.push({ en: `I work as ${enJ}.`, vi: `Tôi làm ${viJ}.` })
    rows.push({ en: `Are you ${enJ}?`, vi: `Bạn là ${viJ} phải không?` })
  }
  for (const [en, vi] of [
    ['See you next week.', 'Hẹn gặp lại tuần sau.'],
    ['Take care.', 'Bảo trọng nhé.'],
    ['Have a good day.', 'Chúc một ngày tốt lành.'],
    ['Have a nice evening.', 'Chúc buổi tối vui vẻ.'],
    ['Welcome.', 'Hoan nghênh.'],
    ['After you.', 'Mời bạn trước.'],
    ['Long time no see.', 'Lâu rồi không gặp.'],
    ['I missed you.', 'Tôi nhớ bạn.'],
    ['Please speak slowly.', 'Làm ơn nói chậm giúp.'],
    ['I understand.', 'Tôi hiểu rồi.'],
    ['I do not understand.', 'Tôi không hiểu.'],
    ['What does that mean?', 'Cái đó nghĩa là gì?'],
    ['Can you help me?', 'Bạn giúp tôi được không?'],
    ['How do you spell that?', 'Cái đó đánh vần thế nào?'],
    ['What do you do?', 'Bạn làm nghề gì?'],
    ['I am learning English.', 'Tôi đang học tiếng Anh.'],
    ['Please write it down.', 'Làm ơn viết ra giúp.'],
    ['Nice talking with you.', 'Rất vui được nói chuyện với bạn.'],
    ['Where are you from?', 'Bạn đến từ đâu?'],
    ['What is your name?', 'Bạn tên gì?'],
    ['Do you speak English?', 'Bạn nói tiếng Anh được không?'],
    ['Do you speak Vietnamese?', 'Bạn nói tiếng Việt được không?'],
    ['Can you repeat that?', 'Bạn nói lại được không?'],
    ['Please speak a little louder.', 'Làm ơn nói to hơn một chút.'],
    ['I am just visiting.', 'Tôi chỉ đến chơi thôi.'],
    ['It is nice here.', 'Ở đây rất dễ chịu.'],
    ['The weather is hot.', 'Trời nóng quá.'],
    ['The weather is nice.', 'Trời đẹp quá.'],
  ]) {
    rows.push({ en, vi })
  }
  return take('greet', rows, 'Chào hỏi hằng ngày')
}

function cafe() {
  const drinks = [
    ['an iced latte', 'một ly latte đá'],
    ['a hot latte', 'một ly latte nóng'],
    ['an iced coffee', 'một ly cà phê đá'],
    ['a black coffee', 'một ly cà phê đen'],
    ['a cappuccino', 'một ly cappuccino'],
    ['an espresso', 'một ly espresso'],
    ['a mocha', 'một ly mocha'],
    ['a matcha latte', 'một ly matcha latte'],
    ['a green tea', 'một ly trà xanh'],
    ['a milk tea', 'một ly trà sữa'],
    ['an orange juice', 'một ly nước cam'],
    ['a lemonade', 'một ly nước chanh'],
    ['a hot chocolate', 'một ly chocolate nóng'],
    ['a smoothie', 'một ly sinh tố'],
    ['a coconut coffee', 'một ly cà phê dừa'],
    ['a Vietnamese coffee', 'một ly cà phê Việt'],
    ['a soy latte', 'một ly latte sữa đậu nành'],
    ['an oat latte', 'một ly latte sữa yến mạch'],
    ['a sparkling water', 'một chai nước có ga'],
    ['a bottle of water', 'một chai nước'],
    ['an Americano', 'một ly Americano'],
    ['a flat white', 'một ly flat white'],
    ['a peach tea', 'một ly trà đào'],
    ['a coconut water', 'một ly nước dừa'],
  ]
  const food = [
    ['a croissant', 'một bánh sừng bò'],
    ['a sandwich', 'một bánh sandwich'],
    ['a slice of cake', 'một miếng bánh'],
    ['a cookie', 'một cái bánh quy'],
    ['a bagel', 'một bánh bagel'],
    ['french fries', 'khoai tây chiên'],
    ['a salad', 'một đĩa salad'],
    ['a muffin', 'một bánh muffin'],
    ['a donut', 'một bánh donut'],
    ['a cheese tart', 'một bánh tart phô mai'],
    ['a banana bread', 'một bánh chuối'],
    ['an egg waffle', 'một bánh trứng'],
  ]
  const milks = [
    ['oat milk', 'sữa yến mạch'],
    ['soy milk', 'sữa đậu nành'],
    ['almond milk', 'sữa hạnh nhân'],
    ['coconut milk', 'sữa dừa'],
    ['whole milk', 'sữa tươi'],
  ]
  const sizes = [
    ['small', 'size nhỏ'],
    ['medium', 'size vừa'],
    ['large', 'size lớn'],
  ]
  const rows = [
    { en: 'Can I see the menu, please?', vi: 'Cho tôi xem thực đơn được không?', ipa: '/kæn aɪ siː ðə ˈmenjuː pliːz/' },
    { en: 'I would like an iced latte, please.', vi: 'Cho tôi một ly latte đá.', ipa: '/aɪ wʊd laɪk ən aɪst ˈlɑːteɪ pliːz/' },
    { en: 'Can I have it to go?', vi: 'Cho mang đi được không?', ipa: '/kæn aɪ hæv ɪt tə ɡəʊ/' },
    { en: 'Is this drink very sweet?', vi: 'Đồ uống này có ngọt lắm không?', ipa: '/ɪz ðɪs drɪŋk ˈveri swiːt/' },
    { en: 'Can I have less sugar, please?', vi: 'Cho ít đường thôi được không?', ipa: '/kæn aɪ hæv les ˈʃʊɡər pliːz/' },
    { en: 'Do you have oat milk?', vi: 'Quán có sữa yến mạch không?', ipa: '/duː juː hæv əʊt mɪlk/' },
    { en: 'How much is this?', vi: 'Cái này bao nhiêu tiền?', ipa: '/haʊ mʌtʃ ɪz ðɪs/' },
    { en: 'Can I pay by card?', vi: 'Tôi thanh toán bằng thẻ được không?', ipa: '/kæn aɪ peɪ baɪ kɑːd/' },
  ]
  for (const [en, vi] of drinks) {
    rows.push({ en: `I would like ${en}, please.`, vi: `Cho tôi ${vi}.` })
    rows.push({ en: `Can I have ${en}?`, vi: `Cho tôi ${vi} được không?` })
    rows.push({ en: `I will have ${en}.`, vi: `Tôi lấy ${vi}.` })
    rows.push({ en: `Do you have ${en}?`, vi: `Quán có ${vi} không?` })
    rows.push({ en: `Is ${en} very sweet?`, vi: `${vi} có ngọt lắm không?` })
    rows.push({ en: `Can I have ${en} to go?`, vi: `${vi} mang đi được không?` })
    rows.push({ en: `Can I have ${en} for here?`, vi: `${vi} uống tại chỗ được không?` })
    rows.push({ en: `How much is ${en}?`, vi: `${vi} giá bao nhiêu?` })
    rows.push({ en: `I would like ${en} with less sugar.`, vi: `Cho tôi ${vi} ít đường.` })
    rows.push({ en: `Can I have ${en} with no ice?`, vi: `${vi} không đá được không?` })
  }
  for (const [en, vi] of food) {
    rows.push({ en: `Can I have ${en} as well?`, vi: `Cho thêm ${vi} nữa được không?` })
    rows.push({ en: `I would like ${en}, please.`, vi: `Cho tôi ${vi}.` })
    rows.push({ en: `Is ${en} fresh?`, vi: `${vi} còn ngon không?` })
    rows.push({ en: `Do you have ${en}?`, vi: `Quán có ${vi} không?` })
    rows.push({ en: `How much is ${en}?`, vi: `${vi} giá bao nhiêu?` })
  }
  for (const [enD, viD] of drinks.slice(0, 16)) {
    for (const [enM, viM] of milks) {
      rows.push({ en: `Can I have ${enD} with ${enM}?`, vi: `${viD} với ${viM} được không?` })
    }
    for (const [enS, viS] of sizes) {
      rows.push({ en: `I would like a ${enS} ${enD.replace(/^an? /, '')}.`, vi: `Cho tôi ${viD} ${viS}.` })
    }
  }
  return take('cafe', rows, 'Gọi đồ ở quán')
}

function restaurant() {
  const dishes = [
    ['grilled chicken', 'gà nướng'],
    ['fried rice', 'cơm chiên'],
    ['pho', 'phở'],
    ['beef noodles', 'bún bò'],
    ['spring rolls', 'chả giò'],
    ['grilled fish', 'cá nướng'],
    ['vegetable soup', 'canh rau'],
    ['steak', 'bít tết'],
    ['pasta', 'mì Ý'],
    ['pizza', 'pizza'],
    ['sushi', 'sushi'],
    ['salad', 'salad'],
    ['tofu', 'đậu phụ'],
    ['shrimp', 'tôm'],
    ['pork ribs', 'sườn heo'],
    ['rice paper rolls', 'gỏi cuốn'],
    ['chicken curry', 'cà ri gà'],
    ['tom yum', 'tom yum'],
    ['fried noodles', 'mì xào'],
    ['grilled beef', 'bò nướng'],
    ['broken rice', 'cơm tấm'],
    ['bun cha', 'bún chả'],
    ['banh mi', 'bánh mì'],
    ['seafood hotpot', 'lẩu hải sản'],
  ]
  const people = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
  const peopleVi = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám']
  const allergies = [
    ['peanuts', 'đậu phộng'],
    ['shrimp', 'tôm'],
    ['milk', 'sữa'],
    ['eggs', 'trứng'],
    ['gluten', 'gluten'],
    ['soy', 'đậu nành'],
    ['fish', 'cá'],
    ['sesame', 'mè'],
  ]
  const rows = [
    { en: 'A table for two, please.', vi: 'Cho bàn hai người.', ipa: '/ə ˈteɪbl fɔː tuː pliːz/' },
    { en: 'What do you recommend?', vi: 'Bạn gợi ý món nào?', ipa: '/wɒt duː juː ˌrekəˈmend/' },
    { en: 'I am allergic to peanuts.', vi: 'Tôi bị dị ứng đậu phộng.', ipa: '/aɪ æm əˈlɜːdʒɪk tə ˈpiːnʌts/' },
    { en: 'I would like the grilled chicken, please.', vi: 'Cho tôi món gà nướng.', ipa: '/aɪ wʊd laɪk ðə ɡrɪld ˈtʃɪkɪn pliːz/' },
    { en: 'Can we have some water, please?', vi: 'Cho chúng tôi ít nước được không?', ipa: '/kæn wiː hæv səm ˈwɔːtər pliːz/' },
    { en: 'This is not what I ordered.', vi: 'Đây không phải món tôi đã gọi.', ipa: '/ðɪs ɪz nɒt wɒt aɪ ˈɔːdəd/' },
    { en: 'Could we have the bill, please?', vi: 'Cho chúng tôi xin hóa đơn.', ipa: '/kʊd wiː hæv ðə bɪl pliːz/' },
    { en: 'We will split the bill.', vi: 'Chúng tôi sẽ chia hóa đơn.', ipa: '/wiː wɪl splɪt ðə bɪl/' },
  ]
  people.forEach((en, i) => {
    rows.push({ en: `A table for ${en}, please.`, vi: `Cho bàn ${peopleVi[i]} người.` })
    rows.push({ en: `Do you have a table for ${en}?`, vi: `Có bàn ${peopleVi[i]} người không?` })
    rows.push({ en: `We are a party of ${en}.`, vi: `Chúng tôi ${peopleVi[i]} người.` })
  })
  for (const [en, vi] of allergies) {
    rows.push({ en: `I am allergic to ${en}.`, vi: `Tôi bị dị ứng ${vi}.` })
    rows.push({ en: `Does this dish contain ${en}?`, vi: `Món này có ${vi} không?` })
    rows.push({ en: `Please no ${en}.`, vi: `Làm ơn đừng cho ${vi}.` })
  }
  for (const [en, vi] of dishes) {
    rows.push({ en: `I would like the ${en}, please.`, vi: `Cho tôi món ${vi}.` })
    rows.push({ en: `Can I have the ${en}?`, vi: `Cho tôi ${vi} được không?` })
    rows.push({ en: `Is the ${en} spicy?`, vi: `Món ${vi} có cay không?` })
    rows.push({ en: `What is in the ${en}?`, vi: `Món ${vi} gồm những gì?` })
    rows.push({ en: `Do you recommend the ${en}?`, vi: `Bạn có gợi ý món ${vi} không?` })
    rows.push({ en: `I will have the ${en}.`, vi: `Tôi gọi món ${vi}.` })
    rows.push({ en: `Can we share the ${en}?`, vi: `Chúng tôi chia món ${vi} được không?` })
    rows.push({ en: `Can I have the ${en} without chili?`, vi: `Món ${vi} không cay được không?` })
    rows.push({ en: `Is the ${en} good here?`, vi: `Ở đây món ${vi} có ngon không?` })
  }
  return take('rest', rows, 'Gọi món nhà hàng')
}

function shopping() {
  const items = [
    ['this shirt', 'áo này'],
    ['this dress', 'váy này'],
    ['these shoes', 'đôi giày này'],
    ['this bag', 'túi này'],
    ['this jacket', 'áo khoác này'],
    ['this hat', 'mũ này'],
    ['these jeans', 'quần jeans này'],
    ['this skirt', 'váy ngắn này'],
    ['this watch', 'đồng hồ này'],
    ['this pair of glasses', 'cặp kính này'],
    ['this wallet', 'ví này'],
    ['this scarf', 'khăn này'],
    ['this t-shirt', 'áo thun này'],
    ['these socks', 'đôi tất này'],
    ['this coat', 'áo choàng này'],
    ['this belt', 'thắt lưng này'],
    ['this sweater', 'áo len này'],
    ['this phone case', 'ốp điện thoại này'],
    ['this backpack', 'balo này'],
    ['this umbrella', 'cây dù này'],
  ]
  const sizes = [
    ['a smaller size', 'size nhỏ hơn'],
    ['a larger size', 'size lớn hơn'],
    ['size S', 'size S'],
    ['size M', 'size M'],
    ['size L', 'size L'],
    ['size XL', 'size XL'],
  ]
  const colors = [
    ['black', 'màu đen'],
    ['white', 'màu trắng'],
    ['blue', 'màu xanh'],
    ['red', 'màu đỏ'],
    ['beige', 'màu be'],
    ['green', 'màu xanh lá'],
    ['brown', 'màu nâu'],
    ['pink', 'màu hồng'],
  ]
  const rows = [
    { en: 'I am just looking, thank you.', vi: 'Tôi chỉ xem thôi, cảm ơn.', ipa: '/aɪ æm dʒʌst ˈlʊkɪŋ θæŋk juː/' },
    { en: 'Do you have this in a smaller size?', vi: 'Cái này có size nhỏ hơn không?', ipa: '/duː juː hæv ðɪs ɪn ə ˈsmɔːlər saɪz/' },
    { en: 'Can I try this on?', vi: 'Tôi thử cái này được không?', ipa: '/kæn aɪ traɪ ðɪs ɒn/' },
    { en: 'How much does this cost?', vi: 'Cái này giá bao nhiêu?', ipa: '/haʊ mʌtʃ dʌz ðɪs kɒst/' },
    { en: 'Is there a discount?', vi: 'Có giảm giá không?', ipa: '/ɪz ðeər ə ˈdɪskaʊnt/' },
    { en: 'I will take this one.', vi: 'Tôi lấy cái này.', ipa: '/aɪ wɪl teɪk ðɪs wʌn/' },
    { en: 'Can I return this if it does not fit?', vi: 'Không vừa thì tôi trả lại được không?', ipa: '/kæn aɪ rɪˈtɜːn ðɪs ɪf ɪt dʌz nɒt fɪt/' },
    { en: 'Could I have a bag, please?', vi: 'Cho tôi xin một túi được không?', ipa: '/kʊd aɪ hæv ə bæɡ pliːz/' },
  ]
  for (const [en, vi] of items) {
    rows.push({ en: `How much does ${en} cost?`, vi: `${vi} giá bao nhiêu?` })
    rows.push({ en: `Can I try ${en} on?`, vi: `Tôi thử ${vi} được không?` })
    rows.push({ en: `I will take ${en}.`, vi: `Tôi lấy ${vi}.` })
    rows.push({ en: `Do you have ${en} in another color?`, vi: `${vi} có màu khác không?` })
    rows.push({ en: `Is ${en} on sale?`, vi: `${vi} có đang giảm giá không?` })
    rows.push({ en: `Can I return ${en} later?`, vi: `Tôi trả lại ${vi} sau được không?` })
    rows.push({ en: `Where can I try ${en} on?`, vi: `Tôi thử ${vi} ở đâu?` })
    for (const [enS, viS] of sizes) {
      rows.push({ en: `Do you have ${en} in ${enS}?`, vi: `${vi} có ${viS} không?` })
    }
    for (const [enC, viC] of colors) {
      rows.push({ en: `Do you have ${en} in ${enC}?`, vi: `${vi} có ${viC} không?` })
    }
  }
  return take('shop', rows, 'Mua sắm')
}

function directions() {
  const places = [
    ['the station', 'nhà ga'],
    ['the museum', 'bảo tàng'],
    ['the hospital', 'bệnh viện'],
    ['the hotel', 'khách sạn'],
    ['the airport', 'sân bay'],
    ['the market', 'chợ'],
    ['the park', 'công viên'],
    ['the beach', 'bãi biển'],
    ['the bank', 'ngân hàng'],
    ['the post office', 'bưu điện'],
    ['the supermarket', 'siêu thị'],
    ['the pharmacy', 'nhà thuốc'],
    ['the temple', 'chùa'],
    ['the university', 'trường đại học'],
    ['the bus stop', 'trạm xe buýt'],
    ['the taxi stand', 'điểm taxi'],
    ['the city center', 'trung tâm thành phố'],
    ['the restroom', 'nhà vệ sinh'],
    ['the police station', 'đồn cảnh sát'],
    ['the embassy', 'đại sứ quán'],
    ['the mall', 'trung tâm thương mại'],
    ['the cafe', 'quán cà phê'],
    ['the restaurant', 'nhà hàng'],
    ['this address', 'địa chỉ này'],
  ]
  const rows = [
    { en: 'Excuse me, where is the nearest station?', vi: 'Xin lỗi, nhà ga gần nhất ở đâu?', ipa: '/ɪkˈskjuːz miː weər ɪz ðə ˈnɪərɪst ˈsteɪʃn/' },
    { en: 'How do I get to the museum?', vi: 'Làm sao để đến bảo tàng?', ipa: '/haʊ duː aɪ ɡet tə ðə mjuˈziːəm/' },
    { en: 'Is it within walking distance?', vi: 'Đi bộ tới được không?', ipa: '/ɪz ɪt wɪˈðɪn ˈwɔːkɪŋ ˈdɪstəns/' },
    { en: 'Go straight and turn left at the lights.', vi: 'Đi thẳng rồi rẽ trái ở đèn giao thông.', ipa: '/ɡəʊ streɪt ənd tɜːn left ət ðə laɪts/' },
    { en: 'How long does it take?', vi: 'Mất bao lâu?', ipa: '/haʊ lɒŋ dʌz ɪt teɪk/' },
    { en: 'Which bus should I take?', vi: 'Tôi nên bắt xe buýt nào?', ipa: '/wɪtʃ bʌs ʃʊd aɪ teɪk/' },
    { en: 'I think I am lost.', vi: 'Tôi nghĩ mình bị lạc.', ipa: '/aɪ θɪŋk aɪ æm lɒst/' },
    { en: 'Could you show me on the map?', vi: 'Bạn chỉ giúp trên bản đồ được không?', ipa: '/kʊd juː ʃəʊ miː ɒn ðə mæp/' },
  ]
  for (const [en, vi] of places) {
    rows.push({ en: `Excuse me, where is ${en}?`, vi: `Xin lỗi, ${vi} ở đâu?` })
    rows.push({ en: `How do I get to ${en}?`, vi: `Làm sao để đến ${vi}?` })
    rows.push({ en: `Is ${en} far from here?`, vi: `${vi} có xa đây không?` })
    rows.push({ en: `Is ${en} within walking distance?`, vi: `${vi} đi bộ tới được không?` })
    rows.push({ en: `Which bus goes to ${en}?`, vi: `Xe buýt nào đi ${vi}?` })
    rows.push({ en: `How long does it take to get to ${en}?`, vi: `Đến ${vi} mất bao lâu?` })
    rows.push({ en: `Could you show me ${en} on the map?`, vi: `Bạn chỉ ${vi} trên bản đồ được không?` })
    rows.push({ en: `I am looking for ${en}.`, vi: `Tôi đang tìm ${vi}.` })
    rows.push({ en: `Which way is ${en}?`, vi: `${vi} hướng nào?` })
    rows.push({ en: `Can I walk to ${en}?`, vi: `Tôi đi bộ tới ${vi} được không?` })
    rows.push({ en: `Is there a taxi to ${en}?`, vi: `Có taxi tới ${vi} không?` })
  }
  return take('dir', rows, 'Hỏi đường')
}

function hotel() {
  const things = [
    ['an extra towel', 'thêm một khăn tắm'],
    ['an extra pillow', 'thêm một gối'],
    ['an extra blanket', 'thêm một chăn'],
    ['a toothbrush', 'một bàn chải'],
    ['some water', 'ít nước'],
    ['a hair dryer', 'một máy sấy tóc'],
    ['an adapter', 'một ổ chuyển'],
    ['a late checkout', 'trả phòng muộn'],
    ['a wake-up call', 'một cuộc gọi đánh thức'],
    ['the Wi-Fi password', 'mật khẩu Wi-Fi'],
    ['an extra hanger', 'thêm móc áo'],
    ['a bottle of water', 'một chai nước'],
    ['an iron', 'một bàn ủi'],
    ['a city map', 'một bản đồ thành phố'],
  ]
  const rooms = [
    ['a single room', 'phòng đơn'],
    ['a double room', 'phòng đôi'],
    ['a twin room', 'phòng hai giường'],
    ['a family room', 'phòng gia đình'],
    ['a suite', 'phòng suite'],
    ['a quiet room', 'phòng yên tĩnh'],
    ['a room with a view', 'phòng nhìn ra view'],
    ['a non-smoking room', 'phòng không hút thuốc'],
    ['an accessible room', 'phòng cho người khuyết tật'],
    ['a king room', 'phòng giường king'],
  ]
  const nights = [
    ['one night', 'một đêm'],
    ['two nights', 'hai đêm'],
    ['three nights', 'ba đêm'],
    ['four nights', 'bốn đêm'],
    ['five nights', 'năm đêm'],
    ['a week', 'một tuần'],
  ]
  const names = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Dang', 'Bui', 'Do', 'Ngo']
  const numbers = ['201', '305', '412', '508', '612', '703', '809', '910', '1002', '1215']
  const places = [
    ['the gym', 'phòng gym'],
    ['the pool', 'hồ bơi'],
    ['the restaurant', 'nhà hàng'],
    ['the lobby', 'sảnh'],
    ['the elevator', 'thang máy'],
    ['the spa', 'spa'],
    ['the parking lot', 'bãi xe'],
    ['the business center', 'trung tâm dịch vụ'],
  ]
  const rows = [
    { en: 'I have a reservation under Nguyen.', vi: 'Tôi đã đặt phòng dưới tên Nguyễn.', ipa: '/aɪ hæv ə ˌrezəˈveɪʃn ˈʌndər ŋwɪən/' },
    { en: 'What time is check-in and check-out?', vi: 'Nhận phòng và trả phòng lúc mấy giờ?', ipa: '/wɒt taɪm ɪz tʃek ɪn ənd tʃek aʊt/' },
    { en: 'Is breakfast included?', vi: 'Giá phòng đã gồm bữa sáng chưa?', ipa: '/ɪz ˈbrekfəst ɪnˈkluːdɪd/' },
    { en: 'The Wi-Fi password, please?', vi: 'Cho hỏi mật khẩu Wi-Fi?', ipa: '/ðə ˈwaɪfaɪ ˈpɑːswɜːd pliːz/' },
    { en: 'Could I have an extra towel?', vi: 'Cho tôi thêm một khăn tắm được không?', ipa: '/kʊd aɪ hæv ən ˈekstrə ˈtaʊəl/' },
    { en: 'The air conditioner is not working.', vi: 'Máy lạnh không hoạt động.', ipa: '/ðiː eər kənˈdɪʃənər ɪz nɒt ˈwɜːkɪŋ/' },
    { en: 'Can I leave my luggage here?', vi: 'Tôi gửi hành lý ở đây được không?', ipa: '/kæn aɪ liːv maɪ ˈlʌɡɪdʒ hɪər/' },
    { en: 'I would like a wake-up call at 6 a.m.', vi: 'Nhờ đánh thức lúc 6 giờ sáng.', ipa: '/aɪ wʊd laɪk ə weɪk ʌp kɔːl ət sɪks eɪ em/' },
  ]
  for (const name of names) {
    rows.push({ en: `I have a reservation under ${name}.`, vi: `Tôi đã đặt phòng dưới tên ${name}.` })
    rows.push({ en: `The booking is under ${name}.`, vi: `Đơn đặt phòng mang tên ${name}.` })
    rows.push({ en: `Can you find the booking for ${name}?`, vi: `Bạn tìm giúp đơn của ${name} được không?` })
  }
  for (const [en, vi] of things) {
    rows.push({ en: `Could I have ${en}?`, vi: `Cho tôi ${vi} được không?` })
    rows.push({ en: `I need ${en}, please.`, vi: `Tôi cần ${vi}.` })
    rows.push({ en: `Can you send ${en} to my room?`, vi: `Nhờ gửi ${vi} lên phòng giúp.` })
    rows.push({ en: `I would like ${en}, please.`, vi: `Cho tôi ${vi}.` })
  }
  for (const [en, vi] of rooms) {
    for (const [enN, viN] of nights) {
      rows.push({ en: `I would like ${en} for ${enN}.`, vi: `Tôi muốn ${vi} ${viN}.` })
      rows.push({ en: `Do you have ${en} for ${enN}?`, vi: `Còn ${vi} ${viN} không?` })
    }
    rows.push({ en: `Is ${en} available?`, vi: `Còn ${vi} không?` })
    rows.push({ en: `How much is ${en}?`, vi: `${vi} giá bao nhiêu?` })
    rows.push({ en: `Can I see ${en}?`, vi: `Tôi xem ${vi} được không?` })
  }
  for (const room of numbers) {
    rows.push({ en: `I am in room ${room}.`, vi: `Tôi ở phòng ${room}.` })
    rows.push({ en: `Can you send it to room ${room}?`, vi: `Nhờ gửi lên phòng ${room}.` })
    rows.push({ en: `Is room ${room} ready?`, vi: `Phòng ${room} đã sẵn sàng chưa?` })
    rows.push({ en: `The key for room ${room} does not work.`, vi: `Thẻ phòng ${room} không mở được.` })
  }
  for (const [en, vi] of places) {
    rows.push({ en: `Where is ${en}?`, vi: `${vi} ở đâu?` })
    rows.push({ en: `How do I get to ${en}?`, vi: `Đi ${vi} thế nào?` })
    rows.push({ en: `Is ${en} open?`, vi: `${vi} có đang mở không?` })
    rows.push({ en: `What time does ${en} open?`, vi: `${vi} mở cửa lúc mấy giờ?` })
  }
  for (const [en, vi] of [
    ['The shower is not working.', 'Vòi sen không hoạt động.'],
    ['The TV is not working.', 'Tivi không hoạt động.'],
    ['There is no hot water.', 'Không có nước nóng.'],
    ['The room is too noisy.', 'Phòng quá ồn.'],
    ['I need to check out.', 'Tôi muốn trả phòng.'],
    ['Can I extend my stay?', 'Tôi ở thêm được không?'],
    ['Is parking free?', 'Đỗ xe có miễn phí không?'],
    ['Can I pay by card?', 'Tôi trả thẻ được không?'],
  ]) {
    rows.push({ en, vi })
  }
  return take('hotel', rows, 'Khách sạn')
}

function health() {
  const symptoms = [
    ['a headache', 'đau đầu'],
    ['a fever', 'sốt'],
    ['a cough', 'ho'],
    ['a sore throat', 'đau họng'],
    ['a stomachache', 'đau bụng'],
    ['a toothache', 'đau răng'],
    ['a backache', 'đau lưng'],
    ['a runny nose', 'sổ mũi'],
    ['dizziness', 'chóng mặt'],
    ['nausea', 'buồn nôn'],
    ['a rash', 'nổi mẩn'],
    ['an allergy', 'dị ứng'],
    ['a cold', 'cảm'],
    ['the flu', 'cúm'],
    ['pain in my chest', 'đau ngực'],
    ['pain in my leg', 'đau chân'],
    ['pain in my arm', 'đau tay'],
    ['trouble breathing', 'khó thở'],
    ['a high temperature', 'sốt cao'],
    ['no appetite', 'mất cảm giác ngon miệng'],
  ]
  const days = [
    ['one day', 'một ngày'],
    ['two days', 'hai ngày'],
    ['three days', 'ba ngày'],
    ['four days', 'bốn ngày'],
    ['five days', 'năm ngày'],
    ['a week', 'một tuần'],
    ['two weeks', 'hai tuần'],
    ['since yesterday', 'từ hôm qua'],
  ]
  const rows = [
    { en: 'I do not feel well.', vi: 'Tôi cảm thấy không khỏe.', ipa: '/aɪ duː nɒt fiːl wel/' },
    { en: 'I have a headache and a fever.', vi: 'Tôi bị đau đầu và sốt.', ipa: '/aɪ hæv ə ˈhedeɪk ənd ə ˈfiːvər/' },
    { en: 'It has been like this for two days.', vi: 'Tình trạng này đã được hai ngày.', ipa: '/ɪt hæz biːn laɪk ðɪs fɔː tuː deɪz/' },
    { en: 'I need to see a doctor.', vi: 'Tôi cần gặp bác sĩ.', ipa: '/aɪ niːd tə siː ə ˈdɒktər/' },
    { en: 'Do I need a prescription for this?', vi: 'Thuốc này có cần đơn không?', ipa: '/duː aɪ niːd ə prɪˈskrɪpʃn fɔː ðɪs/' },
    { en: 'How often should I take this medicine?', vi: 'Tôi nên uống thuốc này bao lâu một lần?', ipa: '/haʊ ˈɒfn ʃʊd aɪ teɪk ðɪs ˈmedsn/' },
    { en: 'I have health insurance.', vi: 'Tôi có bảo hiểm y tế.', ipa: '/aɪ hæv helθ ɪnˈʃʊərəns/' },
    { en: 'Can I make an appointment for tomorrow?', vi: 'Tôi đặt lịch ngày mai được không?', ipa: '/kæn aɪ meɪk ən əˈpɔɪntmənt fɔː təˈmɒrəʊ/' },
  ]
  for (const [en, vi] of symptoms) {
    rows.push({ en: `I have ${en}.`, vi: `Tôi bị ${vi}.` })
    rows.push({ en: `I have had ${en} since yesterday.`, vi: `Tôi bị ${vi} từ hôm qua.` })
    rows.push({ en: `The ${en.replace(/^an? /, '')} is getting worse.`, vi: `${vi} đang nặng hơn.` })
    rows.push({ en: `Do you have medicine for ${en}?`, vi: `Có thuốc cho ${vi} không?` })
    rows.push({ en: `I need something for ${en}.`, vi: `Tôi cần thuốc cho ${vi}.` })
    rows.push({ en: `Can you help me with ${en}?`, vi: `Bạn giúp tôi với ${vi} được không?` })
    rows.push({ en: `I need to see a doctor for ${en}.`, vi: `Tôi cần gặp bác sĩ vì ${vi}.` })
    rows.push({ en: `Can I make an appointment for ${en}?`, vi: `Tôi đặt lịch vì ${vi} được không?` })
    rows.push({ en: `Is this medicine for ${en}?`, vi: `Thuốc này có phải cho ${vi} không?` })
    rows.push({ en: `How should I treat ${en}?`, vi: `Tôi nên xử lý ${vi} thế nào?` })
    for (const [enD, viD] of days) {
      const enLine = enD.startsWith('since')
        ? `I have had ${en} ${enD}.`
        : `I have had ${en} for ${enD}.`
      rows.push({ en: enLine, vi: `Tôi bị ${vi} ${enD.startsWith('since') ? viD : `đã ${viD}`}.` })
    }
  }
  return take('health', rows, 'Sức khỏe')
}

function work() {
  const days = [
    ['Monday', 'thứ Hai'],
    ['Tuesday', 'thứ Ba'],
    ['Wednesday', 'thứ Tư'],
    ['Thursday', 'thứ Năm'],
    ['Friday', 'thứ Sáu'],
    ['Saturday', 'thứ Bảy'],
    ['Sunday', 'Chủ nhật'],
    ['tomorrow', 'ngày mai'],
    ['today', 'hôm nay'],
    ['next week', 'tuần sau'],
  ]
  const tasks = [
    ['the report', 'báo cáo'],
    ['the email', 'email'],
    ['the presentation', 'bài thuyết trình'],
    ['the meeting notes', 'biên bản họp'],
    ['the invoice', 'hóa đơn'],
    ['the contract', 'hợp đồng'],
    ['the design', 'bản thiết kế'],
    ['the schedule', 'lịch'],
    ['the update', 'bản cập nhật'],
    ['the file', 'tệp'],
    ['the budget', 'ngân sách'],
    ['the proposal', 'đề xuất'],
  ]
  const people = ['Anna', 'Minh', 'Linh', 'Hoa', 'Nam', 'Lan', 'Khoa', 'Trang']
  const rows = [
    { en: 'Could we schedule a meeting this week?', vi: 'Chúng ta xếp một cuộc họp tuần này được không?', ipa: '/kʊd wiː ˈʃedjuːl ə ˈmiːtɪŋ ðɪs wiːk/' },
    { en: 'I will send you an email to confirm.', vi: 'Tôi sẽ gửi email để xác nhận.', ipa: '/aɪ wɪl send juː ən ˈiːmeɪl tə kənˈfɜːm/' },
    { en: 'Sorry, I am running a few minutes late.', vi: 'Xin lỗi, tôi sẽ đến muộn vài phút.', ipa: '/ˈsɒri aɪ æm ˈrʌnɪŋ ə fjuː ˈmɪnɪts leɪt/' },
    { en: 'Could you speak a bit more slowly?', vi: 'Bạn nói chậm hơn một chút được không?', ipa: '/kʊd juː spiːk ə bɪt mɔː ˈsləʊli/' },
    { en: 'Let me check and get back to you.', vi: 'Để tôi kiểm tra rồi phản hồi lại.', ipa: '/let miː tʃek ənd ɡet bæk tə juː/' },
    { en: 'The deadline is Friday.', vi: 'Hạn chót là thứ Sáu.', ipa: '/ðə ˈdedlaɪn ɪz ˈfraɪdeɪ/' },
    { en: 'I will take the day off tomorrow.', vi: 'Ngày mai tôi xin nghỉ.', ipa: '/aɪ wɪl teɪk ðə deɪ ɒf təˈmɒrəʊ/' },
    { en: 'Thanks for your help on this.', vi: 'Cảm ơn bạn đã hỗ trợ việc này.', ipa: '/θæŋks fɔː jɔː help ɒn ðɪs/' },
  ]
  for (const [en, vi] of days) {
    rows.push({ en: `Can we meet on ${en}?`, vi: `Chúng ta họp vào ${vi} được không?` })
    rows.push({ en: `The deadline is ${en}.`, vi: `Hạn chót là ${vi}.` })
    rows.push({ en: `I am off on ${en}.`, vi: `${vi} tôi nghỉ.` })
    rows.push({ en: `I will send it by ${en}.`, vi: `Tôi sẽ gửi trước ${vi}.` })
    rows.push({ en: `Are you free on ${en}?`, vi: `${vi} bạn có rảnh không?` })
    rows.push({ en: `Can we move the meeting to ${en}?`, vi: `Chúng ta dời họp sang ${vi} được không?` })
  }
  for (const [en, vi] of tasks) {
    rows.push({ en: `I will send ${en} today.`, vi: `Hôm nay tôi sẽ gửi ${vi}.` })
    rows.push({ en: `Can you review ${en}?`, vi: `Bạn xem giúp ${vi} được không?` })
    rows.push({ en: `I have finished ${en}.`, vi: `Tôi đã xong ${vi}.` })
    rows.push({ en: `I need more time for ${en}.`, vi: `Tôi cần thêm thời gian cho ${vi}.` })
    rows.push({ en: `Who is working on ${en}?`, vi: `Ai đang làm ${vi}?` })
    rows.push({ en: `Please update ${en}.`, vi: `Làm ơn cập nhật ${vi}.` })
    rows.push({ en: `I cannot open ${en}.`, vi: `Tôi không mở được ${vi}.` })
    rows.push({ en: `Can we discuss ${en}?`, vi: `Chúng ta bàn ${vi} được không?` })
    for (const name of people) {
      rows.push({ en: `Can ${name} review ${en}?`, vi: `${name} xem giúp ${vi} được không?` })
    }
  }
  return take('work', rows, 'Công việc')
}

function family() {
  const people = [
    ['my older sister', 'chị gái tôi'],
    ['my younger sister', 'em gái tôi'],
    ['my older brother', 'anh trai tôi'],
    ['my younger brother', 'em trai tôi'],
    ['my mother', 'mẹ tôi'],
    ['my father', 'bố tôi'],
    ['my parents', 'bố mẹ tôi'],
    ['my son', 'con trai tôi'],
    ['my daughter', 'con gái tôi'],
    ['my husband', 'chồng tôi'],
    ['my wife', 'vợ tôi'],
    ['my grandmother', 'bà tôi'],
    ['my grandfather', 'ông tôi'],
    ['my cousin', 'anh chị em họ của tôi'],
    ['my uncle', 'chú tôi'],
    ['my aunt', 'cô tôi'],
    ['my friend', 'bạn tôi'],
    ['my best friend', 'bạn thân tôi'],
    ['my neighbor', 'hàng xóm tôi'],
    ['my classmate', 'bạn cùng lớp tôi'],
  ]
  const plans = [
    ['this weekend', 'cuối tuần này'],
    ['tonight', 'tối nay'],
    ['tomorrow', 'ngày mai'],
    ['on Saturday', 'thứ Bảy'],
    ['on Sunday', 'Chủ nhật'],
    ['after work', 'sau giờ làm'],
    ['this evening', 'chiều tối nay'],
    ['next Friday', 'thứ Sáu tuần sau'],
  ]
  const rows = [
    { en: 'This is my older sister.', vi: 'Đây là chị gái tôi.', ipa: '/ðɪs ɪz maɪ ˈəʊldər ˈsɪstər/' },
    { en: 'I live with my parents.', vi: 'Tôi sống cùng bố mẹ.', ipa: '/aɪ lɪv wɪð maɪ ˈpeərənts/' },
    { en: 'What are you doing this weekend?', vi: 'Cuối tuần này bạn làm gì?', ipa: '/wɒt ɑːr juː ˈduːɪŋ ðɪs ˈwiːkend/' },
    { en: 'Would you like to come over for dinner?', vi: 'Bạn qua nhà ăn tối chứ?', ipa: '/wʊd juː laɪk tə kʌm ˈəʊvər fɔː ˈdɪnər/' },
    { en: 'I miss you. Let us catch up soon.', vi: 'Nhớ bạn. Lát nữa mình gặp nhau nhé.', ipa: '/aɪ mɪs juː let əs kætʃ ʌp suːn/' },
    { en: 'Congratulations! I am so happy for you.', vi: 'Chúc mừng! Mình vui thay cho bạn.', ipa: '/kənˌɡrætʃuˈleɪʃnz aɪ æm səʊ ˈhæpi fɔː juː/' },
    { en: 'Can I bring a friend?', vi: 'Tôi rủ thêm một người bạn được không?', ipa: '/kæn aɪ brɪŋ ə frend/' },
    { en: 'Give my regards to your family.', vi: 'Gửi lời hỏi thăm gia đình bạn.', ipa: '/ɡɪv maɪ rɪˈɡɑːdz tə jɔː ˈfæməli/' },
  ]
  for (const [en, vi] of people) {
    rows.push({ en: `This is ${en}.`, vi: `Đây là ${vi}.` })
    rows.push({ en: `I live with ${en}.`, vi: `Tôi sống cùng ${vi}.` })
    rows.push({ en: `I miss ${en}.`, vi: `Tôi nhớ ${vi}.` })
    rows.push({ en: `Please say hi to ${en}.`, vi: `Nhờ gửi lời chào ${vi}.` })
    rows.push({ en: `Can ${en} come too?`, vi: `${vi} đi cùng được không?` })
    rows.push({ en: `How is ${en}?`, vi: `${vi} dạo này thế nào?` })
    rows.push({ en: `I will call ${en}.`, vi: `Tôi sẽ gọi ${vi}.` })
    for (const [enP, viP] of plans) {
      rows.push({ en: `Can ${en} join us ${enP}?`, vi: `${viP} ${vi} đi cùng được không?` })
    }
  }
  for (const [en, vi] of plans) {
    rows.push({ en: `What are you doing ${en}?`, vi: `${vi} bạn làm gì?` })
    rows.push({ en: `Are you free ${en}?`, vi: `${vi} bạn có rảnh không?` })
    rows.push({ en: `Would you like to have dinner ${en}?`, vi: `${vi} mình ăn tối nhé?` })
    rows.push({ en: `Let us catch up ${en}.`, vi: `${vi} mình gặp nhau nhé.` })
  }
  return take('fam', rows, 'Gia đình và bạn bè')
}

function phone() {
  const names = ['Anna', 'Minh', 'Linh', 'Hoa', 'Nam', 'Lan', 'Khoa', 'Trang', 'Mai', 'Hung']
  const mins = ['two', 'three', 'five', 'ten', 'fifteen', 'twenty', 'thirty']
  const minsVi = ['hai', 'ba', 'năm', 'mười', 'mười lăm', 'hai mươi', 'ba mươi']
  const extras = [
    ['The signal is bad.', 'Sóng kém.'],
    ['I cannot hear you.', 'Tôi không nghe rõ.'],
    ['You are breaking up.', 'Cuộc gọi bị đứt quãng.'],
    ['Can you speak louder?', 'Bạn nói to hơn được không?'],
    ['I will text you the address.', 'Tôi sẽ nhắn địa chỉ cho bạn.'],
    ['I will text you the time.', 'Tôi sẽ nhắn giờ cho bạn.'],
    ['I will text you the location.', 'Tôi sẽ nhắn vị trí cho bạn.'],
    ['Please send me a photo.', 'Gửi tôi một tấm ảnh nhé.'],
    ['I am driving. I will call later.', 'Tôi đang lái xe. Lát nữa tôi gọi.'],
    ['I am in a meeting.', 'Tôi đang họp.'],
  ]
  const rows = [
    { en: 'Hello, this is Minh speaking.', vi: 'Alo, tôi là Minh đây.', ipa: '/həˈləʊ ðɪs ɪz mɪn ˈspiːkɪŋ/' },
    { en: 'May I speak to Anna, please?', vi: 'Cho tôi gặp Anna được không?', ipa: '/meɪ aɪ spiːk tə ˈænə pliːz/' },
    { en: 'The signal is bad. Can you hear me?', vi: 'Sóng kém. Bạn nghe tôi rõ không?', ipa: '/ðə ˈsɪɡnl ɪz bæd kæn juː hɪər miː/' },
    { en: 'I will call you back in five minutes.', vi: 'Năm phút nữa tôi gọi lại.', ipa: '/aɪ wɪl kɔːl juː bæk ɪn faɪv ˈmɪnɪts/' },
    { en: 'Could you please leave a message?', vi: 'Bạn để lại lời nhắn được không?', ipa: '/kʊd juː pliːz liːv ə ˈmesɪdʒ/' },
    { en: 'Sorry, I think you have the wrong number.', vi: 'Xin lỗi, tôi nghĩ bạn gọi nhầm số.', ipa: '/ˈsɒri aɪ θɪŋk juː hæv ðə rɒŋ ˈnʌmbər/' },
    { en: 'Can you text me the address?', vi: 'Bạn nhắn địa chỉ cho tôi được không?', ipa: '/kæn juː tekst miː ðiː əˈdres/' },
    { en: 'I am in a meeting. I will text you later.', vi: 'Tôi đang họp. Lát nữa tôi nhắn lại.', ipa: '/aɪ æm ɪn ə ˈmiːtɪŋ aɪ wɪl tekst juː ˈleɪtər/' },
  ]
  for (const name of names) {
    rows.push({ en: `Hello, this is ${name} speaking.`, vi: `Alo, tôi là ${name} đây.` })
    rows.push({ en: `May I speak to ${name}, please?`, vi: `Cho tôi gặp ${name} được không?` })
    rows.push({ en: `Can I leave a message for ${name}?`, vi: `Tôi để lại lời nhắn cho ${name} được không?` })
    rows.push({ en: `Please tell ${name} I called.`, vi: `Nhờ nói với ${name} là tôi đã gọi.` })
    rows.push({ en: `Is ${name} available?`, vi: `${name} có đang rảnh không?` })
    rows.push({ en: `I will text ${name} later.`, vi: `Lát nữa tôi nhắn ${name}.` })
    rows.push({ en: `Can you ask ${name} to call me?`, vi: `Nhờ ${name} gọi lại cho tôi được không?` })
    rows.push({ en: `I am calling about ${name}.`, vi: `Tôi gọi về việc của ${name}.` })
    mins.forEach((en, i) => {
      rows.push({
        en: `I will call ${name} back in ${en} minutes.`,
        vi: `${minsVi[i]} phút nữa tôi gọi lại ${name}.`,
      })
    })
  }
  mins.forEach((en, i) => {
    rows.push({ en: `I will call you back in ${en} minutes.`, vi: `${minsVi[i]} phút nữa tôi gọi lại.` })
    rows.push({ en: `Can you wait ${en} minutes?`, vi: `Bạn chờ ${minsVi[i]} phút được không?` })
    rows.push({ en: `I am busy for ${en} minutes.`, vi: `Tôi bận khoảng ${minsVi[i]} phút.` })
  })
  for (const [en, vi] of extras) {
    rows.push({ en, vi })
    rows.push({ en: `Sorry, ${softenEn(en)}`, vi: `Xin lỗi, ${softenVi(vi)}` })
  }
  return take('phone', rows, 'Điện thoại')
}

function airport() {
  const airlines = [
    'Vietnam Airlines',
    'Bamboo Airways',
    'Vietjet',
    'Emirates',
    'Singapore Airlines',
    'Korean Air',
    'ANA',
    'Japan Airlines',
    'Qatar Airways',
    'Thai Airways',
  ]
  const items = [
    ['a window seat', 'ghế cạnh cửa sổ'],
    ['an aisle seat', 'ghế cạnh lối đi'],
    ['a seat together', 'ghế ngồi cạnh nhau'],
    ['a vegetarian meal', 'suất ăn chay'],
    ['an extra bag', 'thêm một kiện hành lý'],
    ['a boarding pass', 'thẻ lên máy bay'],
    ['a gate change', 'đổi cổng'],
    ['a later flight', 'chuyến bay muộn hơn'],
    ['an earlier flight', 'chuyến bay sớm hơn'],
    ['a wheelchair', 'xe lăn'],
  ]
  const places = [
    ['the restroom', 'nhà vệ sinh'],
    ['the gate', 'cổng lên máy bay'],
    ['the baggage claim', 'nơi nhận hành lý'],
    ['the information desk', 'quầy thông tin'],
    ['the taxi stand', 'điểm taxi'],
    ['the currency exchange', 'quầy đổi tiền'],
    ['the lounge', 'phòng chờ'],
    ['security', 'khu soi chiếu'],
    ['immigration', 'xuất nhập cảnh'],
    ['the lost and found', 'nơi nhặt được đồ'],
  ]
  const rows = [
    { en: 'Where is the check-in counter for Vietnam Airlines?', vi: 'Quầy check-in của Vietnam Airlines ở đâu?', ipa: '/weər ɪz ðə tʃek ɪn ˈkaʊntər fɔː ˌvjetˈnæm ˈeəlaɪnz/' },
    { en: 'I would like a window seat, please.', vi: 'Cho tôi ghế cạnh cửa sổ.', ipa: '/aɪ wʊd laɪk ə ˈwɪndəʊ siːt pliːz/' },
    { en: 'Is this bag within the weight limit?', vi: 'Túi này có vượt quá giới hạn cân nặng không?', ipa: '/ɪz ðɪs bæɡ wɪˈðɪn ðə weɪt ˈlɪmɪt/' },
    { en: 'Which gate is my flight?', vi: 'Chuyến bay của tôi ở cổng nào?', ipa: '/wɪtʃ ɡeɪt ɪz maɪ flaɪt/' },
    { en: 'Has the flight been delayed?', vi: 'Chuyến bay có bị trễ không?', ipa: '/hæz ðə flaɪt biːn dɪˈleɪd/' },
    { en: 'I have lost my boarding pass.', vi: 'Tôi làm mất thẻ lên máy bay.', ipa: '/aɪ hæv lɒst maɪ ˈbɔːdɪŋ pɑːs/' },
    { en: 'Is there a power outlet near here?', vi: 'Gần đây có ổ sạc không?', ipa: '/ɪz ðeər ə ˈpaʊər ˈaʊtlet nɪər hɪər/' },
    { en: 'Where can I pick up my luggage?', vi: 'Tôi nhận hành lý ở đâu?', ipa: '/weər kæn aɪ pɪk ʌp maɪ ˈlʌɡɪdʒ/' },
  ]
  for (const airline of airlines) {
    rows.push({ en: `Where is the check-in counter for ${airline}?`, vi: `Quầy check-in của ${airline} ở đâu?` })
    rows.push({ en: `Is this the line for ${airline}?`, vi: `Đây có phải hàng của ${airline} không?` })
    rows.push({ en: `I am flying with ${airline}.`, vi: `Tôi bay hãng ${airline}.` })
    rows.push({ en: `Has the ${airline} flight been delayed?`, vi: `Chuyến của ${airline} có bị trễ không?` })
    rows.push({ en: `Where is the gate for ${airline}?`, vi: `Cổng của ${airline} ở đâu?` })
    rows.push({ en: `I need to change my ${airline} flight.`, vi: `Tôi cần đổi chuyến ${airline}.` })
    for (const [en, vi] of items) {
      rows.push({ en: `Does ${airline} still have ${en}?`, vi: `${airline} còn ${vi} không?` })
    }
  }
  for (const [en, vi] of items) {
    rows.push({ en: `I would like ${en}, please.`, vi: `Cho tôi ${vi}.` })
    rows.push({ en: `Can I get ${en}?`, vi: `Tôi xin ${vi} được không?` })
    rows.push({ en: `Do you still have ${en}?`, vi: `Còn ${vi} không?` })
    rows.push({ en: `How much is ${en}?`, vi: `${vi} hết bao nhiêu?` })
    rows.push({ en: `I have lost ${en}.`, vi: `Tôi làm mất ${vi}.` })
  }
  for (const [en, vi] of places) {
    rows.push({ en: `Where is ${en}?`, vi: `${vi} ở đâu?` })
    rows.push({ en: `How do I get to ${en}?`, vi: `Làm sao để đến ${vi}?` })
    rows.push({ en: `Is ${en} this way?`, vi: `${vi} có phải hướng này không?` })
    rows.push({ en: `Excuse me, where is ${en}?`, vi: `Xin lỗi, ${vi} ở đâu?` })
  }
  return take('air', rows, 'Sân bay')
}

function emergency() {
  const lost = [
    ['my bag', 'túi của tôi'],
    ['my wallet', 'ví của tôi'],
    ['my phone', 'điện thoại của tôi'],
    ['my passport', 'hộ chiếu của tôi'],
    ['my ticket', 'vé của tôi'],
    ['my keys', 'chìa khóa của tôi'],
    ['my camera', 'máy ảnh của tôi'],
    ['my luggage', 'hành lý của tôi'],
    ['my glasses', 'kính của tôi'],
    ['my credit card', 'thẻ của tôi'],
    ['my documents', 'giấy tờ của tôi'],
    ['my money', 'tiền của tôi'],
    ['my laptop', 'máy tính của tôi'],
    ['my watch', 'đồng hồ của tôi'],
    ['my visa', 'visa của tôi'],
  ]
  const places = [
    ['the hospital', 'bệnh viện'],
    ['the police station', 'đồn cảnh sát'],
    ['the embassy', 'đại sứ quán'],
    ['the pharmacy', 'nhà thuốc'],
    ['the hotel', 'khách sạn'],
    ['the airport', 'sân bay'],
    ['the nearest hospital', 'bệnh viện gần nhất'],
    ['the nearest pharmacy', 'nhà thuốc gần nhất'],
    ['the nearest police station', 'đồn cảnh sát gần nhất'],
    ['the tourist police', 'cảnh sát du lịch'],
  ]
  const extra = [
    ['Please call the police.', 'Làm ơn gọi cảnh sát.'],
    ['Please call an ambulance.', 'Làm ơn gọi xe cấp cứu.'],
    ['I need help now.', 'Tôi cần giúp đỡ ngay.'],
    ['This is an emergency.', 'Đây là tình huống khẩn cấp.'],
    ['I am hurt.', 'Tôi bị thương.'],
    ['Someone is hurt.', 'Có người bị thương.'],
    ['I do not feel safe.', 'Tôi cảm thấy không an toàn.'],
    ['Please stay with me.', 'Làm ơn ở lại với tôi.'],
    ['I need to contact my family.', 'Tôi cần liên hệ gia đình.'],
    ['I need to contact my embassy.', 'Tôi cần liên hệ đại sứ quán.'],
    ['I need a translator.', 'Tôi cần thông dịch viên.'],
    ['I was robbed.', 'Tôi bị cướp.'],
    ['I fell down.', 'Tôi bị ngã.'],
    ['I cut my hand.', 'Tôi bị đứt tay.'],
    ['Please call my hotel.', 'Làm ơn gọi khách sạn của tôi.'],
    ['Please call my family.', 'Làm ơn gọi gia đình tôi.'],
    ['I do not remember what happened.', 'Tôi không nhớ chuyện gì đã xảy ra.'],
    ['Can you stay with me?', 'Bạn ở lại với tôi được không?'],
    ['Where can I get help?', 'Tôi có thể tìm giúp đỡ ở đâu?'],
  ]
  const rows = [
    { en: 'Help! Please call the police.', vi: 'Cứu tôi! Làm ơn gọi cảnh sát.', ipa: '/help pliːz kɔːl ðə pəˈliːs/' },
    { en: 'I need an ambulance.', vi: 'Tôi cần xe cấp cứu.', ipa: '/aɪ niːd ən ˈæmbjələns/' },
    { en: 'Someone has stolen my bag.', vi: 'Có người lấy trộm túi của tôi.', ipa: '/ˈsʌmwʌn hæz ˈstəʊlən maɪ bæɡ/' },
    { en: 'I have lost my passport.', vi: 'Tôi làm mất hộ chiếu.', ipa: '/aɪ hæv lɒst maɪ ˈpɑːspɔːt/' },
    { en: 'Where is the nearest hospital?', vi: 'Bệnh viện gần nhất ở đâu?', ipa: '/weər ɪz ðə ˈnɪərɪst ˈhɒspɪtl/' },
    { en: 'I am a tourist. I do not speak much English.', vi: 'Tôi là khách du lịch. Tôi nói tiếng Anh không nhiều.', ipa: '/aɪ æm ə ˈtʊərɪst aɪ duː nɒt spiːk mʌtʃ ˈɪŋɡlɪʃ/' },
    { en: 'Can I use your phone, please?', vi: 'Cho tôi mượn điện thoại được không?', ipa: '/kæn aɪ juːz jɔː fəʊn pliːz/' },
    { en: 'Please contact my embassy.', vi: 'Làm ơn liên hệ đại sứ quán của tôi.', ipa: '/pliːz ˈkɒntækt maɪ ˈembəsi/' },
  ]
  for (const [en, vi] of lost) {
    rows.push({ en: `I have lost ${en}.`, vi: `Tôi làm mất ${vi}.` })
    rows.push({ en: `Someone has stolen ${en}.`, vi: `Có người lấy trộm ${vi}.` })
    rows.push({ en: `I cannot find ${en}.`, vi: `Tôi không tìm thấy ${vi}.` })
    rows.push({ en: `Did anyone see ${en}?`, vi: `Có ai thấy ${vi} không?` })
    rows.push({ en: `Please help me find ${en}.`, vi: `Làm ơn giúp tôi tìm ${vi}.` })
    rows.push({ en: `I left ${en} here.`, vi: `Tôi để quên ${vi} ở đây.` })
    rows.push({ en: `Has anyone turned in ${en}?`, vi: `Có ai nộp ${vi} không?` })
    rows.push({ en: `I need to report ${en} stolen.`, vi: `Tôi cần trình báo ${vi} bị mất cắp.` })
    for (const [enP, viP] of places) {
      rows.push({ en: `I lost ${en} near ${enP}.`, vi: `Tôi làm mất ${vi} gần ${viP}.` })
    }
  }
  for (const [en, vi] of places) {
    rows.push({ en: `Where is ${en}?`, vi: `${vi} ở đâu?` })
    rows.push({ en: `Please take me to ${en}.`, vi: `Làm ơn đưa tôi đến ${vi}.` })
    rows.push({ en: `I need to go to ${en} now.`, vi: `Tôi cần đến ${vi} ngay.` })
    rows.push({ en: `Is ${en} open now?`, vi: `${vi} hiện có mở cửa không?` })
    rows.push({ en: `How far is ${en}?`, vi: `${vi} cách đây bao xa?` })
  }
  for (const [en, vi] of extra) {
    rows.push({ en, vi })
    rows.push({ en: `Help! ${en}`, vi: `Cứu tôi! ${vi}` })
    rows.push({ en: `Excuse me, ${softenEn(en)}`, vi: `Xin lỗi, ${softenVi(vi)}` })
  }
  return take('emg', rows, 'Khẩn cấp')
}

const banks = {
  greetings: greetings(),
  cafe: cafe(),
  restaurant: restaurant(),
  shopping: shopping(),
  directions: directions(),
  hotel: hotel(),
  health: health(),
  work: work(),
  family: family(),
  phone: phone(),
  airport: airport(),
  emergency: emergency(),
}

for (const [name, phrases] of Object.entries(banks)) {
  writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(phrases)}\n`)
  console.log(name, phrases.length, phrases[0].en, '|', phrases[7].en)
}
