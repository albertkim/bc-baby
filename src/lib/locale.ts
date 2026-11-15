export const LOCALES = ['en', 'fr', 'zh-Hans', 'zh-Hant', 'ko'] as const
export type Locale = (typeof LOCALES)[number]
export const LOCALE_COOKIE = 'bc-baby-language'
export const SITE_URL = 'https://bc-baby.vercel.app/'

export const LANGUAGES: Record<
  Locale,
  { label: string; instruction: string; og: string }
> = {
  en: {
    label: 'English',
    instruction: 'English (Canadian spelling)',
    og: 'en_CA',
  },
  fr: {
    label: 'Français',
    instruction: 'French (natural Canadian French)',
    og: 'fr_CA',
  },
  'zh-Hans': {
    label: '简体中文',
    instruction:
      'natural written Chinese using Simplified characters, with everyday wording familiar to parents in British Columbia',
    og: 'zh_CN',
  },
  'zh-Hant': {
    label: '繁體中文',
    instruction:
      'natural written Chinese using Traditional characters, with everyday wording familiar to parents in British Columbia',
    og: 'zh_TW',
  },
  ko: {
    label: '한국어',
    instruction: 'Korean (warm, polite 해요 style)',
    og: 'ko_KR',
  },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.some((locale) => locale === value)
}

export function localeHref(locale: Locale) {
  // Explicit English must also override a remembered or detected language.
  return `/?lang=${locale}`
}

function matchLanguage(tag: string): Locale | undefined {
  const value = tag.toLowerCase()
  if (/^zh(?:-|$)/.test(value)) {
    if (value.includes('-hant')) return 'zh-Hant'
    if (value.includes('-hans')) return 'zh-Hans'
    return /^zh-(tw|hk|mo)(?:-|$)/.test(value) ? 'zh-Hant' : 'zh-Hans'
  }
  return (['en', 'fr', 'ko'] as const).find(
    (language) => value === language || value.startsWith(`${language}-`),
  )
}

export function preferredLocale(acceptLanguage = ''): Locale {
  const preferences = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...parameters] = part.trim().split(';')
      const quality = parameters.find((parameter) =>
        parameter.trim().startsWith('q='),
      )
      return {
        tag,
        quality: quality ? Number(quality.trim().slice(2)) : 1,
        index,
      }
    })
    .filter(
      ({ quality }) => Number.isFinite(quality) && quality > 0 && quality <= 1,
    )
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
  for (const { tag } of preferences) {
    const locale = matchLanguage(tag)
    if (locale) return locale
  }
  return 'en'
}

export const CHAT_ERRORS = [
  'INVALID_REQUEST',
  'TOO_LONG',
  'EMPTY_QUESTION',
  'QUESTION_TOO_LONG',
  'UNAVAILABLE',
  'FAILED',
  'STOPPED',
] as const
export type ChatError = (typeof CHAT_ERRORS)[number]
export function isChatError(value: string): value is ChatError {
  return CHAT_ERRORS.some((code) => code === value)
}

export type TopicId = 'pregnancy' | 'baby' | 'toddler' | 'parenting'
export const TOPIC_IDS: TopicId[] = [
  'pregnancy',
  'baby',
  'toddler',
  'parenting',
]
type Topic = { label: string; questions: [string, string, string] }
type Messages = {
  title: string
  description: string
  language: string
  home: string
  about: string
  aboutTitle: string
  aboutDescription: string
  madeBy: string
  email: string
  closeAbout: string
  newChat: string
  chat: string
  conversation: string
  yourQuestion: string
  answer: string
  reading: string
  retry: string
  ask: string
  placeholder: string
  stop: string
  welcome: string
  subtitle: string
  topicsLabel: string
  cover: string
  province: string
  iconAlt: string
  sources: string
  sourceLanguage: string
  topics: Record<TopicId, Topic>
  errors: Record<ChatError, string>
}

export const MESSAGES: Record<Locale, Messages> = {
  en: {
    title: 'BC Baby · Pregnancy, baby & toddler questions',
    description:
      'Ask about pregnancy, baby care and toddler development with answers grounded in BC’s Baby’s Best Chance and Toddler’s First Steps handbooks.',
    language: 'Language',
    home: 'BC Baby home',
    about: 'About',
    aboutTitle: 'About BC Baby',
    aboutDescription:
      'I’m Albert, a parent in BC. I made this so BC’s pregnancy, baby, and toddler handbooks are easier to use on a phone.',
    madeBy: 'Made by Albert Kim',
    email: 'Email',
    closeAbout: 'Close About',
    newChat: 'New chat',
    chat: 'Handbook chat',
    conversation: 'Handbook conversation',
    yourQuestion: 'Your question',
    answer: 'Handbook answer',
    reading: 'Reading the handbooks…',
    retry: 'Try again',
    ask: 'Ask',
    placeholder: 'Ask a question…',
    stop: 'Stop',
    welcome: 'What’s on your mind?',
    subtitle: 'Ask the handbooks',
    topicsLabel: 'Question topics',
    cover: 'handbook cover',
    province: 'Province of British Columbia',
    iconAlt: 'BC Baby’s smiling baby icon',
    sources: 'Sources',
    sourceLanguage:
      'Answers use the English 2024 handbooks. Source links open those editions.',
    topics: {
      pregnancy: {
        label: 'Pregnancy',
        questions: [
          'How can I ease nausea during pregnancy?',
          'Which foods should I avoid while pregnant?',
          'How can I tell if labour is starting?',
        ],
      },
      baby: {
        label: 'Baby',
        questions: [
          'How can I help my baby sleep safely?',
          'How can I tell if my baby is getting enough milk?',
          'What can I try when my baby won’t stop crying?',
        ],
      },
      toddler: {
        label: 'Toddler',
        questions: [
          'What can I do when my toddler has a tantrum?',
          'How can I handle picky eating?',
          'How do I know if my child is ready to use the toilet?',
        ],
      },
      parenting: {
        label: 'Parenting',
        questions: [
          'What can help with recovery after birth?',
          'What can I do when parenting feels overwhelming?',
          'How can my partner and I share the load?',
        ],
      },
    },
    errors: {
      INVALID_REQUEST: 'This question could not be sent. Please try again.',
      TOO_LONG: 'This conversation is too long. Please start a new chat.',
      EMPTY_QUESTION: 'Please enter a question.',
      QUESTION_TOO_LONG:
        'Please keep your question to 4,000 characters or fewer.',
      UNAVAILABLE:
        'The handbooks are unavailable right now. Please try again shortly.',
      FAILED: 'The answer could not be completed. Please try again.',
      STOPPED: 'Response stopped.',
    },
  },
  fr: {
    title: 'BC Baby · Grossesse, bébés et tout-petits',
    description:
      'Posez vos questions sur la grossesse, les soins du bébé et le développement des tout-petits. Les réponses s’appuient sur les guides de la Colombie-Britannique.',
    language: 'Langue',
    home: 'Accueil BC Baby',
    about: 'À propos',
    aboutTitle: 'À propos de BC Baby',
    aboutDescription:
      'Je m’appelle Albert et je suis parent en Colombie-Britannique. J’ai créé BC Baby pour rendre les guides provinciaux sur la grossesse, les bébés et les tout-petits plus faciles à consulter sur votre téléphone.',
    madeBy: 'Créé par Albert Kim',
    email: 'Courriel',
    closeAbout: 'Fermer la fenêtre À propos',
    newChat: 'Nouvelle discussion',
    chat: 'Discussion avec les guides',
    conversation: 'Historique de la discussion',
    yourQuestion: 'Votre question',
    answer: 'Réponse des guides',
    reading: 'Consultation des guides…',
    retry: 'Réessayer',
    ask: 'Poser la question',
    placeholder: 'Posez votre question…',
    stop: 'Arrêter',
    welcome: 'Qu’aimeriez-vous savoir?',
    subtitle: 'Des réponses tirées des guides',
    topicsLabel: 'Sujets',
    cover: 'couverture du guide',
    province: 'Province de la Colombie-Britannique',
    iconAlt: 'Le bébé souriant de BC Baby',
    sources: 'Sources',
    sourceLanguage:
      'Les réponses s’appuient sur les guides anglais de 2024. Les liens ouvrent ces éditions.',
    topics: {
      pregnancy: {
        label: 'Grossesse',
        questions: [
          'Comment soulager les nausées pendant la grossesse?',
          'Quels aliments devrais-je éviter pendant la grossesse?',
          'Comment reconnaître le début du travail?',
        ],
      },
      baby: {
        label: 'Bébé',
        questions: [
          'Comment aider mon bébé à dormir en sécurité?',
          'Comment savoir si mon bébé boit assez de lait?',
          'Que faire quand mon bébé n’arrête pas de pleurer?',
        ],
      },
      toddler: {
        label: 'Tout-petit',
        questions: [
          'Que faire quand mon tout-petit fait une crise de colère?',
          'Comment aider mon enfant qui refuse certains aliments?',
          'Comment savoir si mon enfant est prêt à utiliser le petit pot?',
        ],
      },
      parenting: {
        label: 'Vie de parent',
        questions: [
          'Qu’est-ce qui peut aider à récupérer après l’accouchement?',
          'Que faire quand les responsabilités de parent me dépassent?',
          'Comment mieux partager les responsabilités avec mon ou ma partenaire?',
        ],
      },
    },
    errors: {
      INVALID_REQUEST:
        'La question n’a pas pu être envoyée. Veuillez réessayer.',
      TOO_LONG:
        'Cette discussion est trop longue. Commencez une nouvelle discussion.',
      EMPTY_QUESTION: 'Veuillez saisir une question.',
      QUESTION_TOO_LONG: 'Limitez votre question à 4 000 caractères.',
      UNAVAILABLE:
        'Les guides ne sont pas disponibles pour le moment. Veuillez réessayer dans quelques instants.',
      FAILED: 'La réponse n’a pas pu être terminée. Veuillez réessayer.',
      STOPPED: 'Réponse interrompue.',
    },
  },
  'zh-Hans': {
    title: 'BC Baby · 孕期与婴幼儿育儿问答',
    description:
      '依据卑诗省《Baby’s Best Chance》和《Toddler’s First Steps》育儿手册，解答您关于孕期、婴儿照护和幼儿发育的问题。',
    language: '语言',
    home: 'BC Baby 首页',
    about: '关于',
    aboutTitle: '关于 BC Baby',
    aboutDescription:
      '我是 Albert，一位住在卑诗省的家长。我做了 BC Baby，让大家在手机上查阅卑诗省的孕期和婴幼儿育儿手册更方便。',
    madeBy: '由 Albert Kim 制作',
    email: '电子邮件',
    closeAbout: '关闭关于窗口',
    newChat: '新对话',
    chat: '育儿手册问答',
    conversation: '对话记录',
    yourQuestion: '您的问题',
    answer: '手册解答',
    reading: '正在查阅手册…',
    retry: '重试',
    ask: '提问',
    placeholder: '想问些什么？',
    stop: '停止',
    welcome: '有什么想问的？',
    subtitle: '向育儿手册提问',
    topicsLabel: '问题分类',
    cover: '手册封面',
    province: '卑诗省',
    iconAlt: 'BC Baby 的微笑宝宝图标',
    sources: '资料来源',
    sourceLanguage:
      '回答依据 2024 年英文版手册，来源链接会打开对应的英文版本。',
    topics: {
      pregnancy: {
        label: '孕期',
        questions: [
          '怎样缓解孕期恶心？',
          '怀孕期间应避免吃哪些食物？',
          '怎样判断是不是快要生了？',
        ],
      },
      baby: {
        label: '婴儿',
        questions: [
          '怎样让宝宝睡得更安全？',
          '怎样判断宝宝有没有喝够奶？',
          '宝宝一直哭，可以试试哪些方法？',
        ],
      },
      toddler: {
        label: '幼儿',
        questions: [
          '孩子发脾气时，我该怎么办？',
          '孩子挑食怎么办？',
          '怎样判断孩子是否准备好开始如厕训练？',
        ],
      },
      parenting: {
        label: '为人父母',
        questions: [
          '产后怎样帮助身体恢复？',
          '带孩子让我压力很大，该怎么办？',
          '我和伴侣怎样分担育儿责任？',
        ],
      },
    },
    errors: {
      INVALID_REQUEST: '问题未能发送，请重试。',
      TOO_LONG: '这段对话太长了，请开始新对话。',
      EMPTY_QUESTION: '请输入问题。',
      QUESTION_TOO_LONG: '问题不能超过 4,000 个字符。',
      UNAVAILABLE: '暂时无法查阅手册，请稍后重试。',
      FAILED: '回答未能完成，请重试。',
      STOPPED: '已停止回答。',
    },
  },
  'zh-Hant': {
    title: 'BC Baby · 孕期與嬰幼兒育兒問答',
    description:
      '依據卑詩省《Baby’s Best Chance》和《Toddler’s First Steps》育兒手冊，解答您關於孕期、嬰兒照護和幼兒發展的問題。',
    language: '語言',
    home: 'BC Baby 首頁',
    about: '關於',
    aboutTitle: '關於 BC Baby',
    aboutDescription:
      '我是 Albert，一位住在卑詩省的家長。我做了 BC Baby，讓大家在手機上查閱卑詩省的孕期和嬰幼兒育兒手冊更方便。',
    madeBy: '由 Albert Kim 製作',
    email: '電子郵件',
    closeAbout: '關閉關於視窗',
    newChat: '新對話',
    chat: '育兒手冊問答',
    conversation: '對話紀錄',
    yourQuestion: '您的問題',
    answer: '手冊解答',
    reading: '正在查閱手冊…',
    retry: '重試',
    ask: '提問',
    placeholder: '想問些什麼？',
    stop: '停止',
    welcome: '有什麼想問的？',
    subtitle: '向育兒手冊提問',
    topicsLabel: '問題分類',
    cover: '手冊封面',
    province: '卑詩省',
    iconAlt: 'BC Baby 的微笑寶寶圖示',
    sources: '資料來源',
    sourceLanguage:
      '回答依據 2024 年英文版手冊，來源連結會開啟對應的英文版本。',
    topics: {
      pregnancy: {
        label: '孕期',
        questions: [
          '怎樣緩解孕期噁心？',
          '懷孕期間應避免吃哪些食物？',
          '怎樣判斷是不是快要生了？',
        ],
      },
      baby: {
        label: '嬰兒',
        questions: [
          '怎樣讓寶寶睡得更安全？',
          '怎樣判斷寶寶有沒有喝夠奶？',
          '寶寶一直哭，可以試試哪些方法？',
        ],
      },
      toddler: {
        label: '幼兒',
        questions: [
          '孩子發脾氣時，我該怎麼辦？',
          '孩子挑食怎麼辦？',
          '怎樣判斷孩子是否準備好開始如廁訓練？',
        ],
      },
      parenting: {
        label: '為人父母',
        questions: [
          '產後怎樣幫助身體恢復？',
          '照顧孩子讓我壓力很大，該怎麼辦？',
          '我和伴侶怎樣分擔育兒責任？',
        ],
      },
    },
    errors: {
      INVALID_REQUEST: '問題未能傳送，請重試。',
      TOO_LONG: '這段對話太長了，請開始新對話。',
      EMPTY_QUESTION: '請輸入問題。',
      QUESTION_TOO_LONG: '問題不能超過 4,000 個字元。',
      UNAVAILABLE: '暫時無法查閱手冊，請稍後重試。',
      FAILED: '回答未能完成，請重試。',
      STOPPED: '已停止回答。',
    },
  },
  ko: {
    title: 'BC Baby · 임신부터 영유아 돌봄까지',
    description:
      '임신, 아기 돌봄, 영유아 발달에 대해 물어보세요. BC주의 Baby’s Best Chance와 Toddler’s First Steps 안내서를 바탕으로 답해 드려요.',
    language: '언어',
    home: 'BC Baby 홈',
    about: '소개',
    aboutTitle: 'BC Baby 소개',
    aboutDescription:
      '안녕하세요. BC주에서 아이를 키우는 Albert예요. 임신과 영유아 돌봄에 관한 BC주 안내서를 휴대전화에서 더 쉽게 찾아볼 수 있도록 BC Baby를 만들었어요.',
    madeBy: 'Albert Kim이 만들었어요',
    email: '이메일',
    closeAbout: '소개 창 닫기',
    newChat: '새 대화',
    chat: '육아 안내서와 대화',
    conversation: '대화 기록',
    yourQuestion: '내 질문',
    answer: '안내서 답변',
    reading: '안내서를 살펴보고 있어요…',
    retry: '다시 시도',
    ask: '질문하기',
    placeholder: '궁금한 점을 물어보세요…',
    stop: '멈추기',
    welcome: '무엇이 궁금하세요?',
    subtitle: '육아 안내서에 물어보세요',
    topicsLabel: '질문 주제',
    cover: '안내서 표지',
    province: '브리티시컬럼비아주',
    iconAlt: 'BC Baby의 웃는 아기 아이콘',
    sources: '출처',
    sourceLanguage:
      '답변은 2024년 영어판 안내서를 바탕으로 해요. 출처 링크를 누르면 해당 영어판이 열려요.',
    topics: {
      pregnancy: {
        label: '임신',
        questions: [
          '임신 중 메스꺼움을 어떻게 줄일 수 있나요?',
          '임신 중 피해야 할 음식은 무엇인가요?',
          '진통이 시작됐는지 어떻게 알 수 있나요?',
        ],
      },
      baby: {
        label: '아기',
        questions: [
          '아기를 안전하게 재우려면 어떻게 해야 하나요?',
          '아기가 모유나 분유를 충분히 먹고 있는지 어떻게 알 수 있나요?',
          '아기가 계속 울 때 어떤 방법을 써볼 수 있나요?',
        ],
      },
      toddler: {
        label: '걸음마기',
        questions: [
          '아이가 떼를 쓸 때 어떻게 해야 하나요?',
          '아이가 편식할 때 어떻게 도와줄 수 있나요?',
          '아이가 배변 훈련을 할 준비가 됐는지 어떻게 알 수 있나요?',
        ],
      },
      parenting: {
        label: '부모의 일상',
        questions: [
          '출산 후 회복에 무엇이 도움이 되나요?',
          '육아가 너무 버거울 때 어떻게 하면 좋을까요?',
          '파트너와 육아 부담을 어떻게 나눌 수 있나요?',
        ],
      },
    },
    errors: {
      INVALID_REQUEST: '질문을 보내지 못했어요. 다시 시도해 주세요.',
      TOO_LONG: '대화가 너무 길어졌어요. 새 대화를 시작해 주세요.',
      EMPTY_QUESTION: '질문을 입력해 주세요.',
      QUESTION_TOO_LONG: '질문은 4,000자 이내로 입력해 주세요.',
      UNAVAILABLE:
        '지금은 안내서를 살펴볼 수 없어요. 잠시 후 다시 시도해 주세요.',
      FAILED: '답변을 마치지 못했어요. 다시 시도해 주세요.',
      STOPPED: '답변을 멈췄어요.',
    },
  },
}
