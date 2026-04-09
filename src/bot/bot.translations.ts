export const translations = {
  common: {
    welcome:
      "Xush kelibsiz! 🌹\nLaroma Parfume botiga xush kelibsiz. Davom etish uchun, iltimos, telefon raqamingizni yuboring. 👇\n\n" +
      "Добро пожаловать! 🌹\nДобро пожаловать в бот Laroma Parfume. Чтобы продолжить, пожалуйста, отправьте свой номер телефона. 👇",
    request_contact: "📞 Telefon raqamni yuborish / Отправить номер",
  },
  uz: {
    registered: "Siz muvaffaqiyatli roʻyxatdan oʻtdingiz! ✅",
    open_app: "Ilovani ochish 🛍",
    already_registered: "Xush kelibsiz! ✨ Buyurtma berish uchun pastdagi tugmani bosing.",
  },
  ru: {
    registered: "Вы успешно зарегистрированы! ✅",
    open_app: "Открыть приложение 🛍",
    already_registered: "С возвращением! ✨ Для заказа нажмите кнопку ниже.",
  },

} as const;

export type LanguageCode = 'uz' | 'ru';
