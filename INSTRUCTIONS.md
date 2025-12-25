# Инструкция по интеграции Ostrum Shop

## 1. Выдача предметов (Item Delivery)
Для автоматической выдачи предметов на сервере Rust используйте RCON протокол или плагин, работающий с MySQL.

**Рекомендуемый способ (MySQL Plugin):**
1. Установите на сервер Rust плагин магазина, поддерживающий MySQL (например, `Shop` или самописный плагин).
2. Настройте плагин на чтение таблицы `transaction_items` или создайте отдельную таблицу `pending_delivery`.
3. Когда пользователь покупает товар на сайте, Backend создает запись в БД.
4. Плагин на сервере каждые X секунд проверяет БД на наличие новых записей для игрока (по SteamID) и выдает предметы командой `inventory.give` или `kit.give`.

**Способ через RCON (Node.js Backend):**
1. При успешной оплате, Backend соединяется с сервером через RCON (библиотека `rcon-client`).
2. Отправляет команду: `give <steamid> <item_shortname> <amount>`.
3. Минус: Игрок должен быть онлайн.

## 2. Подключение YuKassa (ЮKassa)
1. Зарегистрируйтесь в ЮKassa и получите `shopId` и `Secret Key`.
2. В Backend (Node.js/PHP) создайте эндпоинт `/api/payment/create`.
3. Используйте SDK ЮKassa для создания платежа.
   ```json
   {
     "amount": { "value": "100.00", "currency": "RUB" },
     "capture": true,
     "confirmation": { "type": "redirect", "return_url": "https://yoursite.com/success" },
     "description": "Покупка Ostrum: Kit Start"
   }
   ```
4. Настройте Webhook в личном кабинете ЮKassa на `https://yoursite.com/api/payment/webhook`.
5. При получении уведомления `payment.succeeded`, обновите статус транзакции в БД и вызовите логику выдачи предмета.

## 3. Вход через Steam (Steam Auth)
1. Получите API Key: https://steamcommunity.com/dev/apikey
2. Используйте библиотеку `passport-steam` (Node.js) или `LightOpenID` (PHP).
3. **Frontend:** Кнопка "Войти" ведет на `http://yoursite-backend.com/auth/steam`.
4. **Backend:** Перенаправляет пользователя на страницу входа Valve.
5. **Valve:** Возвращает пользователя на `http://yoursite-backend.com/auth/steam/return` с OpenID данными.
6. **Backend:** Проверяет подпись, извлекает SteamID64, ищет или создает пользователя в БД MySQL. Создает JWT токен и перенаправляет на Frontend с токеном (например, `https://yoursite.com/?token=xyz`).

## 4. Юридическая информация (РФ)
Для соблюдения 152-ФЗ:
*   Разместите файлы "Политика конфиденциальности" и "Публичная оферта" (шаблоны сгенерированы в подвале сайта).
*   Добавьте чекбокс "Я согласен с правилами" при оплате.
*   Сервер с БД персональных данных должен находиться на территории РФ.
