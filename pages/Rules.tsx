
import React from 'react';
import { AlertCircle, Zap, ShieldAlert, Crosshair } from 'lucide-react';

const Rules = () => {
  const ruleSections = [
    {
      title: 'Общие правила',
      icon: <AlertCircle className="text-ostrum-primary" />,
      rules: [
        'Запрещено использование любых видов стороннего ПО (читы, макросы, скрипты).',
        'Запрещена игра в команде, превышающей лимит сервера (MAX 3 и т.д.).',
        'Запрещена пропаганда нацизма, расизма и разжигание межнациональной розни.',
        'Запрещено использование багов игры для получения преимущества.'
      ]
    },
    {
      title: 'Игровой процесс',
      icon: <Crosshair className="text-ostrum-primary" />,
      rules: [
        'Запрещено строительство в текстурах или местах, не предусмотренных игрой.',
        'Запрещено блокирование доступа к монументам на длительный срок.',
        'Запрещено намеренное создание лагов на сервере (крафт огромного кол-ва сущностей).',
        'Оскорбление администрации проекта карается баном.'
      ]
    },
    {
      title: 'Рейды и Гриферство',
      icon: <ShieldAlert className="text-ostrum-primary" />,
      rules: [
        'Запрещено застраивание чужих домов (Griefing) без цели рейда.',
        'Запрещена смена кодов/замков после успешного рейда, если вы не планируете там жить.',
        'Запрещено удерживание игрока в плену более 30 минут.'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">Правила проекта</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Незнание правил не освобождает от ответственности</p>
      </div>

      <div className="grid gap-8">
        {ruleSections.map((section, idx) => (
          <div key={idx} className="bg-ostrum-card rounded-3xl border border-white/5 p-8 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               {/* Fix: Use React.ReactElement<any> to allow additional props like 'size' in cloneElement */}
               {React.cloneElement(section.icon as React.ReactElement<any>, { size: 120 })}
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-ostrum-primary/20 p-3 rounded-xl">
                {section.icon}
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{section.title}</h2>
            </div>

            <ul className="space-y-4">
              {section.rules.map((rule, ridx) => (
                <li key={ridx} className="flex gap-4 items-start">
                  <span className="bg-ostrum-primary/20 text-ostrum-primary text-[10px] font-black px-2 py-1 rounded mt-1">
                    {idx + 1}.{ridx + 1}
                  </span>
                  <p className="text-gray-400 font-medium leading-relaxed">{rule}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-ostrum-accent/10 border border-ostrum-accent/20 rounded-2xl p-6 text-center">
        <p className="text-ostrum-accent font-black uppercase tracking-widest text-sm">
          Администрация оставляет за собой право изменять правила без уведомления игроков
        </p>
      </div>
    </div>
  );
};

export default Rules;
