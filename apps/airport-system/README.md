# מערכת ניהול שדה תעופה — דוגמה מסודרת (שכבות)

הדוגמה הזו מציגה מימוש מלא ב‑JavaScript עם עקרונות OOP (מחלקות, ירושה, אנקפסולציה ופולימורפיזם), יחד עם בדיקות יחידה.

## מבנה שכבות

- **Domain (ישויות עסקיות)** — `src/domain/`
  - `ticket.js` — כרטיסים: `Ticket`, `RegularTicket`, `VipTicket`
  - `passenger.js` — נוסעים: `Passenger`, `StudentPassenger`, `RegularPassenger`
  - `flight.js` — טיסה: `Flight`
- **System/Service (הרכבת מערכת)** — `src/system/`
  - `airport.js` — `Airport` יוצר ומנהל את כל הטיסות
- **Application (הדגמה/הרצה)** — `src/demo.js`

## החלטות עיצוב עיקריות

- **אנקפסולציה**: כסף הנוסע שמור בשדה פרטי (`#money`) עם getter בלבד.
- **ירושה ופולימורפיזם**: `StudentPassenger` ו‑`RegularPassenger` יורשים מ‑`Passenger` ומממשים התנהגות תמחור שונה דרך `getTicketPrice`.
- **כרטיסים**: לכל טיסה נוצר מערך כרטיסים בגודל `maxPassengers` ובחלוקה של 90% רגיל ו‑10% VIP.
- **רכישת כרטיס**: מתבצעת דרך `Passenger.buyTicket`, שמחפש כרטיס פנוי ומחייב מחיר לאחר הנחה.

## איך להריץ את הדוגמה

```bash
node apps/airport-system/src/demo.js
```

הדמו מבצע:
1. יצירת מופע של `Airport`.
2. יצירת שני נוסעים (סטודנט ורגיל).
3. רכישת כרטיס רגיל לנוסע הרגיל.
4. רכישת כרטיס VIP לנוסע הסטודנט.

## בדיקות יחידה

הבדיקות עומדות בדרישות: מספיק/לא מספיק כסף, בדיקת בעלות והפחתת כסף.

```bash
node --test apps/airport-system/test/airport.test.js
```
