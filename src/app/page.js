"use client"
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image";
import stressedImage from '../../public/stressed.jpg'
import { Calendar } from "@/components/ui/calendar"
import {useEffect, useState} from "react";
import {isSameDay} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// local storage keys
const localstorageKeys = {
  schBillsKey: "scheduled-bills",
  paidBillsKey: "paid-bills"
};

export default function Home() {
  const [dueDates, setDueDates] = useState([]);
  const [currentBills, setCurrentBills] = useState([]);
  const [noBills, setNoBills] = useState(false);
  const [newScheduledBillValue, setNewScheduledBillValue] = useState(
      {name: "", amount: "", dayDue: ""}
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // refresh count to force useEffect to run
  const [refreshCount, setRefreshCount] = useState(0);

  // localstorage persistent state
  const [scheduledBills_ls, setScheduledBills_ls] = useState([]);
  const [paidBills_ls, setPaidBills_ls] = useState([]);


  // Load from local storage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScheduledBills = localStorage.getItem(localstorageKeys.schBillsKey);
      const storedPaidBills = localStorage.getItem(localstorageKeys.paidBillsKey);

      let parsedSchedule = [];
      let parsedPaidBills = [];

      if (storedScheduledBills && storedPaidBills !== "null") {
        parsedSchedule = JSON.parse(storedScheduledBills)
        setScheduledBills_ls(parsedSchedule);
      }

      if (storedPaidBills && storedPaidBills !== "null") {
        parsedPaidBills = JSON.parse(storedPaidBills)
        setPaidBills_ls(parsedPaidBills);
      }

        if (parsedSchedule.length > 0) {
          const currentBills = parsedSchedule.map(schBill => {
            const currentMappedBill = {
              id: uuidv4(),
              schBillId: schBill.id,
              name: schBill.name,
              amount: schBill.amount,
              dueDate: createDateFromDay(schBill.dayDue, selectedMonth),
              paid: false
            }

            // Check if the bill has been paid
            if (parsedPaidBills.length > 0) {
              if(parsedPaidBills.find(paidBill => paidBill.schBillId === schBill.id && isSameDay(new Date(paidBill.dueDate), currentMappedBill.dueDate))) {
                currentMappedBill.paid = true;
              }
            }

            return currentMappedBill;
          });

          setCurrentBills(currentBills);
          setDueDates(currentBills.map((bill) => new Date(bill.dueDate)));
        } else {

          setNoBills(true);
        }
    }
  }, [refreshCount, selectedMonth]);

  const saveNewBill = () => {
    if (newScheduledBillValue.name === "" || newScheduledBillValue.amount === "" || newScheduledBillValue.dayDue === "") {
      return;
    }
    const dueDate = createDateFromDay(newScheduledBillValue.dayDue, null);

    const newScheduledBill = {
      id: uuidv4(),
      name: newScheduledBillValue.name,
      amount: newScheduledBillValue.amount,
      dayDue: newScheduledBillValue.dayDue
    };

    const newCurrentBill = {
      id: uuidv4(),
      schBillId: newScheduledBill.id,
      name: newScheduledBillValue.name,
      amount: newScheduledBillValue.amount,
      dueDate: dueDate,
      paid: false
    };

    const updatedScheduledBills = [...scheduledBills_ls, newScheduledBill];
    const updatedCurrentBills = [...currentBills, newCurrentBill];
    setScheduledBills_ls(updatedScheduledBills);
    setCurrentBills(updatedCurrentBills);

    if (typeof window !== "undefined") {
      localStorage.setItem(localstorageKeys.schBillsKey, JSON.stringify(updatedScheduledBills));
    }

    setRefreshCount(refreshCount + 1);
  };

  const markBillPaid = (newPaidBill) => {
    newPaidBill.paid = true;
    const updatedPaidBills = [...paidBills_ls, newPaidBill];
    setPaidBills_ls(updatedPaidBills);
    if (typeof window !== "undefined") {
      localStorage.setItem(localstorageKeys.paidBillsKey, JSON.stringify(updatedPaidBills));
    }
    setRefreshCount(refreshCount + 1);
  };

  const handleAddBillInputChange = (e) => {
    const { name, value } = e.target;
    setNewScheduledBillValue(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex-col z-10 max-w-5xl w-full font-mono text-sm lg:flex">
          <div className="flex flex-row w-full justify-between mb-10">
            <div className="flex flex-row items-center w-3/4 justify-start ml-10">
            <p className="text-4xl font-thin">Pay The Bill</p>
            <Image
                className="rounded-full"
                src={stressedImage}
                alt="Picture of the author"
                width={150}
                height={150}
                placeholder="blur"
            />
            </div>
            <Popover>
              <PopoverTrigger className="mr-10">Menu</PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-y-3">
                  <input type="file" id="fileInput" style={{display: 'none'}} onChange={uploadBillData}/>
                  <Button onClick={() => window.document.getElementById('fileInput').click()} variant="outline" size="sm">
                    Upload Bill Data
                  </Button>
                  <Button onClick={downloadBillData} variant="outline" size="sm">
                    Download Bill Data
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        <div className="flex flex-row w-full gap-x-32 justify-center">
          <div className="flex flex-col">
              <div className="flex flex-row w-full justify-between items-center pb-2">
                <p>Due Date Calendar</p>
                <AddBillButton inputHandler={handleAddBillInputChange} submitHandler={saveNewBill} />
              </div>
              <Calendar
                  className="rounded-md border w-72 animate-fade-in-once"
                  inputProps={{ readOnly: true, disabled: true }}
                  selected={dueDates}
                  onMonthChange={(calMonth) => setSelectedMonth(calMonth.getMonth())}
              />
            </div>
            <div className="flex flex-col gap-y-3 h-[800px] overflow-y-scroll">
              <div className="flex flex-row w-full justify-between items-center pb-2 pr-5">
              <p>Bills for the Month</p>
              </div>
              {noBills ? <NoBillsCard/> :
                currentBills.length > 0 ? sortBillsByDateAndPaid(currentBills).map((bill) => (
                <BillCard
                    key={bill.id}
                    bill={bill}
                    payHandler={() => markBillPaid(bill)}
                />
              )) :   <LoadingSpinner/>
              }
            </div>
          </div>
      </div>
    </main>
  );
}

function BillCard({bill, payHandler}) {
  return (
    <Card className="min-w-96 animate-fade-in-once mr-5">
      <CardTitle>
      {bill.name}
      </CardTitle>
      <CardContent>
        <div className="flex flex-row justify-between">
        </div>
        <span className="font-bold">Amount:</span> ${bill.amount} {bill.paid ? <span className="font-bold text-lime-500">Paid</span>
          : <Button onClick={payHandler} variant="outline">Pay</Button>}
      </CardContent>
      <CardFooter>
        <span className="font-bold">Due On: </span> {formatDate(new Date(bill.dueDate))}
      </CardFooter>
    </Card>
  );
}

function NoBillsCard() {
  return (
      <Card className="min-w-96 animate-fade-in-once mr-5">
        <CardTitle>
          No Bills Due
        </CardTitle>
        <CardContent>
          Lucky you! No bills are due this month.
        </CardContent>
      </Card>
  );
}

function LoadingSpinner() {
  return (
      <div className="min-w-96 min-h-64 justify-self-auto">
        <svg aria-hidden="true"
             className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
             viewBox="0 0 100 101" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"/>
          <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"/>
        </svg>
      </div>);
}

function AddBillButton({inputHandler, submitHandler}) {
  return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">+</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bill to Schedule</DialogTitle>
            <DialogDescription>
              I feel bad for you dawg...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input onChange={inputHandler} placeholder="Name" name="name"/>
              <Input onChange={inputHandler} placeholder="Amount" name="amount"/>
              <Input onChange={inputHandler} placeholder="Day Due" name="dayDue"/>
              <DialogTrigger asChild>
                <Button onClick={submitHandler} variant="secondary" type="submit" size="sm" className="px-3 w-1/3">
                  Add
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}

// helper functions
function uploadBillData(event) {
  let jsonFile = event.target.files[0];
  // Create a new FileReader object
  let reader = new FileReader();

  // Setup the onload event for the reader
  reader.onload = function(readerEvent) {
    // The file's text will be printed here
    let data = JSON.parse(readerEvent.target.result);

    // Iterate over the object and store each key-value pair in local storage
    for (let key in data) {
      if(Object.values(localstorageKeys).includes(key)) {
        if(data[key] !== null) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      }
    }
  };

  // Read the file as text
  reader.readAsText(jsonFile);
}

function downloadBillData() {
  // Create an object to hold local storage data
  let localStorageData = {};

  for (let key of Object.values(localstorageKeys)) {
    localStorageData[key] = JSON.parse(localStorage.getItem(key));
  }
  console.log(localStorageData);
  // Convert object to JSON
  let json = JSON.stringify(localStorageData);
  let blob = new Blob([json], {type: "application/json"});
  let url = URL.createObjectURL(blob);

  // Create a link to download the JSON file
  let link = document.createElement('a');
  link.href = url;
  const currentDate = formatBillDownloadDate(new Date());
  link.download = `billdata-${currentDate}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBillDownloadDate(date) {
  return date.toLocaleDateString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: 'numeric',
  });
}

function createDateFromDay(day, specificMonth) {
  const now = new Date();
  const year = now.getFullYear();
  const month = specificMonth ? specificMonth : now.getMonth();
  return new Date(year, month, day);
}

function sortBillsByDateAndPaid(bills) {
  return bills.sort((a,b) => {
    if (!a.paid && b.paid) {
      return -1;
    }

    if (a.paid && !b.paid) {
      return 1;
    }

    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}
