
/*  Class representing list of expenses */
class ExpenseList {
    constructor() {
        // check if "items" already created in localStorage
        if(!(window.localStorage.getItem("items"))){
            window.localStorage.setItem("items" , JSON.stringify([]));
        }else{
            // if "items" already created in localStorage then render items
            this.renderItems();
        }
    }

    /*  class function for adding new expense to list */
    async addExpense(type , comment , amount ,date , currency){
        let storageItems = JSON.parse(window.localStorage.getItem("items"));
        let expense = new Expense(type , comment , amount ,date , currency);
        storageItems.unshift(expense);
        window.localStorage.setItem("items" , JSON.stringify(storageItems));
        this.renderItem(expense);
        displayChart(savings , expenses, investments, incomes)
        await playSound()
        displayStats();
    }

    /*  function for rendering one expense */
    renderItem(expense){
        let list = document.querySelector("#list");
        //Add html text content
        let html = '<div class="bottom-border"> <div class="expense-row"><div class="expense-date">' + expense.date + ' </div><div class="expense-text"> ' + expense.comment + ' </div><div class="expense-value"> ' + expense.amount +' '+ this.getCurrencySign(expense.currency) + ' </div></div>';
        list.insertAdjacentHTML('afterbegin', html);
        this.setTypeColor(expense.type);
        //Currencies needs to be synchronized in order to be displayed in graph in $
        let syncedAmount = this.syncCurrencies(expense.currency , expense.amount);
        //Add amount to specified statistics
        this.incrementType(expense.type , syncedAmount , expense.currency);
        this.clearExpenseInput();
    }

    /*  function for rendering all expenses in local storage */
    renderItems(){
        let list = document.querySelector("#list");
        list.textContent = "";
        deleteStats();
        let storageItems = JSON.parse(window.localStorage.getItem("items"));
        storageItems.reverse();
        for(let i = 0; i < storageItems.length ; i++){
            this.renderItem(storageItems[i]);
        }
        displayChart(savings , expenses, investments, incomes)
        displayStats();
    }

    /*  function for rendering expenses in chosen month */
    async changeMonthDataRenderItems(month){
        let list = document.querySelector("#list");
        list.textContent = "";
        deleteStats();
        let storageItems = JSON.parse(window.localStorage.getItem("items"));
        storageItems.reverse();
        for(let i = 0; i < storageItems.length ; i++){
            let currentItem = storageItems[i];
            let currentDate = parseStringDate(currentItem.date)
            if(currentDate.getMonth() + 1 === month){
                this.renderItem(currentItem);
            }
        }
        console.log(savings);
        displayChart(savings , expenses, investments, incomes)
        await playSound()
        displayStats();
    }

    /*  function for synchronizing currencies */
    syncCurrencies(currency , amount){
        if(currency === "euro-btn" ){
            return 1.18 * amount;
        }else if(currency === "crown-btn"){
            return 0.045 * amount;
        }else{
            return amount;
        }
    }

    /*  function adding amount to specified statistics */
    incrementType(type , amount){
        switch (type){
            case 'income-btn':
                incomes += parseInt(amount);
                break;
            case 'expense-btn':
                expenses += parseInt(amount);
                break;
            case 'investment-btn':
                investments += parseInt(amount);
                break;
            case 'savings-btn':
                savings += parseInt(amount);
                break;
        }
    }

    /*  function for clearing input values*/
    clearExpenseInput(){
        this.clearExpenseType();
        this.clearCurrencyType();
        document.getElementById("expense-comment").value = ""
        document.getElementById("expense-amount").value = ""
    }

    /*  function for deactivating type buttons */
    clearExpenseType(){
        const buttons = document.querySelectorAll(".decision-button");
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].classList.contains("active")){
                buttons[i].classList.toggle("active");
            }
        }
    }

    /*  function for deactivating currency buttons */
    clearCurrencyType(){
        const buttons = document.querySelectorAll(".currency-button");
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].classList.contains("active")){
                buttons[i].classList.toggle("active");
            }
        }
    }

    /*  function to return currency sign based on string param */
    getCurrencySign(currency){
        switch (currency){
            case 'dollar-btn':
                return "$";
            case 'euro-btn':
                return "€"
            case 'crown-btn':
                return "Kč"
            default:
                return "$";
        }
    }

    /*  function for setting amount color based on expense type param */
    setTypeColor(type){

        const amountText = document.querySelector(".expense-value:not(.painted)");
        switch (type){
            case 'income-btn':
                amountText.classList.toggle("painted");
                amountText.style.color = "#9a4ef1";
                break;
            case 'expense-btn':
                amountText.classList.toggle("painted");
                amountText.style.color = "#f14e4e";
                break;
            case 'investment-btn':
                amountText.classList.toggle("painted");
                amountText.style.color = "#f1bb4e";
                break;
            case 'savings-btn':
                amountText.classList.toggle("painted");
                amountText.style.color = "#42cc8c";
                break;
        }
    }
}

