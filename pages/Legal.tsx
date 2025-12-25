
import React from 'react';
import { Shield, FileText, Scale } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'offer';
}

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const content = {
    terms: {
      title: 'Пользовательское соглашение',
      icon: <FileText className="text-ostrum-primary" size={40} />,
      text: (
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <section>
            <h3 className="text-white font-bold mb-2">1. Общие положения</h3>
            <p>Настоящее Соглашение регулирует отношения между администрацией проекта Ostrum и пользователем сайта. Используя сайт, вы подтверждаете свое согласие с данными условиями.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-2">2. Услуги и цифровые товары</h3>
            <p>Проект предоставляет доступ к виртуальным внутриигровым ценностям. Все покупки являются добровольными пожертвованиями на развитие проекта. Цифровые товары не подлежат возврату или обмену после их зачисления на внутриигровой аккаунт.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-2">3. Ограничение ответственности</h3>
            <p>Администрация не несет ответственности за временную недоступность серверов Rust по техническим причинам или действиям разработчиков игры (Facepunch Studios).</p>
          </section>
        </div>
      )
    },
    privacy: {
      title: 'Политика конфиденциальности',
      icon: <Shield className="text-ostrum-primary" size={40} />,
      text: (
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <section>
            <h3 className="text-white font-bold mb-2">1. Сбор данных</h3>
            <p>В соответствии с 152-ФЗ «О персональных данных», мы собираем только необходимые данные: SteamID, публичный никнейм и аватар профиля Steam. Мы не имеем доступа к вашему паролю или банковским данным.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-2">2. Использование данных</h3>
            <p>Данные используются исключительно для идентификации пользователя на игровых серверах и доставки приобретенных товаров. Мы не передаем данные третьим лицам.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-2">3. Хранение данных</h3>
            <p>Все данные хранятся на защищенных серверах на территории Российской Федерации.</p>
          </section>
        </div>
      )
    },
    offer: {
      title: 'Публичная оферта',
      icon: <Scale className="text-ostrum-primary" size={40} />,
      text: (
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <section>
            <h3 className="text-white font-bold mb-2">1. Предмет оферты</h3>
            <p>Данный документ является официальным предложением (Публичной офертой) проекта Ostrum. Оплата заказа на сайте является акцептом данной оферты.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-2">2. Порядок оплаты</h3>
            <p>Оплата производится через лицензированные платежные агрегаторы (ЮKassa). Моментом оплаты считается зачисление средств на счет магазина.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-2">3. Доставка товара</h3>
            <p>Товар доставляется автоматически в течение 1-10 минут после оплаты во внутриигровой склад профиля. Для получения товара игрок должен находиться на выбранном сервере.</p>
          </section>
        </div>
      )
    }
  };

  const page = content[type];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-ostrum-card rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="bg-ostrum-primary/10 p-5 rounded-2xl mb-6">
            {page.icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            {page.title}
          </h1>
          <div className="w-20 h-1 bg-ostrum-primary mt-4 rounded-full"></div>
        </div>
        
        <div className="prose prose-invert max-w-none">
          {page.text}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600 uppercase font-black tracking-widest">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
