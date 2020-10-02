// create a variable to hold the db connection
let db;
// establish a connection to IndexedDb database called 'budget_app' and set
// it to version 1
const request = indexedDB.open('budget_app', 1);
// this event will happen if the db version changes
request.onupgradeneeded = function(event) {
    // save a reference to the db
    const db = event.target.result;
    // create the object store to hold data
    // and auto increment primary key of sorts
    db.createObjectStore('new_budget', { autoIncrement: true });
    // when success
    request.onsuccess = function(event) {
        // when db is successfullly created with its object store (from onupgradeneeded)
        db = event.target.result;

        // check if app is online, if yes run upload function
        // to send all local data to the db
        if (navigator.onLine) {
            //uploadBudget();
        }
    };

    request.onerror = function(event) {
        // log error
        console.log(event.target.errorCode);
    };
};

// this code is the rules for how to write data to the object store

// this function will happen if we attempt to submit new data
// but there is no internet
function saveBudget(record) {
    // start new transaction with the db to read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to object store with 'add' method
    budgetObjectStore.add(record);
}