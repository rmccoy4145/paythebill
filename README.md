# Pay The Bill
Bills...the bane of humans existence. I needed a way to track my bills, so I spent a Saturday and made 
this simple app to do just that. This app allows you to place bills on a monthly schedule, view them 
on a calendar, mark them as paid, then go on with your day. No fancy databases are used, only the 
browser's local storage is used to store your data. 

## Features
- Bill schedule places due dates on the calendar on the day of the month they are due
- View bills due within the current month
- Add new bills to the schedule
- View paid bills
- Mark bills as paid

## Nice to have
- Edit Bill schedule
- Edit Bill details (amount, due date, etc) on the schedule
- Remove Bill from schedule
- View bills due within the next month
- View bills due on a specific day
- Ability to Save local storage to a file

## Tech Stack
- Nodejs
- NextJs
- TailwindCSS
- Shadcn

## Considerations
- Refractor state that is saved to localstorage into an object