
/*  function for validating input values */
function validateForm(type , currency , comment , amount){
    let message = document.getElementById("validation-message")
    if(type == null) {
        message.innerHTML = "Choose type of expense!";
    }else if(currency == null){
        message.innerHTML = "Choose currency of expense!";
    }else if(comment === ""){
        message.innerHTML = "Add description of expense!";
    }else if(comment.length > 254){
        message.innerHTML = "Description is too long (max 255 chars)!";
    }else if (amount == null){
        message.innerHTML = "Add expense amount!";
    }else if (amount <= 0) {
        message.innerHTML = "Amount must be greater than 0!";
    }
}

/*  function for activating type button after click */
function manageExpenseTypeButtons(type){

    const buttons = document.querySelectorAll(".decision-button");

    for(let i =0 ; i < buttons.length ; i++){

        if(buttons[i].id === type){
            if(buttons[i].classList.contains("active")){
                break;
            }else{
                buttons[i].classList.toggle("active");
            }
        }else{
            if(buttons[i].classList.contains("active")) {
                buttons[i].classList.toggle("active");
            }
        }
    }
}


/*  function for activating currency button after click */
function manageCurrencyTypeButtons(type){

    const buttons = document.querySelectorAll(".currency-button");
    console.log(buttons)

    for(let i =0 ; i < buttons.length ; i++){

        if(buttons[i].id === type){
            if(buttons[i].classList.contains("active")){
                break;
            }else{
                buttons[i].classList.toggle("active");
            }
        }else{
            if(buttons[i].classList.contains("active")) {
                buttons[i].classList.toggle("active");
            }
        }
    }
}


/*  reset all statistics data */
function deleteStats(){
    incomes = 0;
    expenses = 0;
    investments = 0;
    savings = 0;
}


/*  function for activating type button after click */
function getExpenseType(){
    const buttons = document.querySelectorAll(".decision-button");
    for(let i = 0; i < buttons.length; i++){
        if(buttons[i].classList.contains("active")){
            return buttons[i].id;
        }
    }
    return null;
}

/*  function returns selected type of currency */
function getCurrencyType(){
    const buttons = document.querySelectorAll(".currency-button");
    for(let i = 0; i < buttons.length; i++){
        if(buttons[i].classList.contains("active")){
            return buttons[i].id;
        }
    }
    return null;
}


/*  function for displaying statistics */
function displayStats(){
    let cashflow = incomes - expenses;
    let cashflowBox = document.querySelector("#month-cashflow")
    if(cashflow < 0){
        cashflowBox.style.color = "#f14e4e";
    }else{
        cashflowBox.style.color = "#42cc8c";
    }
    cashflowBox.innerText  = "Cashflow : \n$" + numberFormat(cashflow);
    document.querySelector("#month-investments").innerText  = "Investments : \n$" + numberFormat(investments);
    document.querySelector("#month-savings").innerText = "Savings : \n$" + numberFormat(savings);
}

function numberFormat(number) {
    return Intl.NumberFormat().format(number);
}

function parseStringDate(stringDate){
    let parts = stringDate.split(".");
    let dt = null;
    if (parts) {
        dt = new Date(parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10));
    }
    console.log(dt)
    return dt;
}

function resetCanvas(){
    $('#expense-chart').remove();
    $('#graph').append('<canvas id="expense-chart"><canvas>');
};


async function playSound(){
    let sound = new Audio("Resources/Audio/swoosh.mp3")
    await sound.play();
}

/*  function for displaying chart with data */
async function displayChart(savings, expenses, investments , incomes) {

    //before displaying updated canvas , reset old
    resetCanvas();

    let info = document.querySelector("#graph-info");
    let ctx = document.querySelector("#expense-chart");

    if (savings + expenses + investments + incomes >= 0) {
        info.innerHTML = "";
        let expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Savings', 'Expenses', 'Investments', 'Incomes'],
                datasets: [{
                    data: [savings , expenses , investments, incomes] ,
                    backgroundColor: [
                        '#42cc8c',
                        'rgba(255, 84, 98, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(100, 100, 220, 1)'
                    ],
                    borderWidth: 0.5
                }]
            },
            options: {
                legend: {
                    labels: {
                        fontColor: 'white',
                        fontSize: 10
                    }
                }
            },

        });
    } else {
        info.textContent = "";
        info.insertAdjacentHTML('beforeend' , "Something went wrong.")
    }
}
