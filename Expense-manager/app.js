
/* --- Main application script --- */


/*  Statistics variables */
let incomes = 0;
let expenses = 0;
let investments = 0;
let savings = 0;


/*  Initialize and manage date-picker  */
$(function() {
    $('.date-picker').datepicker( {
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'MM yy',
        beforeShow: function (input) {
            setTimeout(function () {
                let buttonPane = $(input)
                    .datepicker("widget")
                    .find(".ui-datepicker-buttonpane");
                let btn = $('<button class="ui-state-default ui-priority-secondary ui-corner-all" type="button">Show All</button>');
                btn.unbind("click")
                    .bind("click", async function () {
                        $(input).datepicker("hide");
                        $(input).val("All");
                        expenseList.renderItems();
                        await playSound()
                    });
                btn.appendTo(buttonPane);
            }, 1);
        },
        onClose: function(dateText, inst) {
            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
        },
        onSelect: function(dateText , inst) {
            let date = $(this).datepicker('getDate');
            let month = date.getMonth() + 1;
            expenseList.changeMonthDataRenderItems(month);
        }
    })
});

const expenseList = new ExpenseList();

let addExpenseBtn = document.querySelector("#add-expense-btn");

addExpenseBtn.addEventListener("click", function() {
    let type = getExpenseType();
    let currency = getCurrencyType();
    let comment = document.getElementById("expense-comment").value
    let amount = document.getElementById("expense-amount").value
    let date = new Date().toLocaleDateString();
    if (comment !== ""&& comment.length < 255 && type != null && amount > 0 && currency != null && amount != null) {
        document.getElementById("validation-message").innerHTML = "";
        expenseList.addExpense(type , comment , amount , date , currency);
    }else{
        validateForm(type , currency , comment , amount);
    }

});

document.getElementById("income-btn").addEventListener("click", function() {
    manageExpenseTypeButtons("income-btn")
});
document.getElementById("expense-btn").addEventListener("click", function() {
    manageExpenseTypeButtons("expense-btn")
});
document.getElementById("investment-btn").addEventListener("click", function() {
    manageExpenseTypeButtons("investment-btn")
});
document.getElementById("savings-btn").addEventListener("click", function() {
    manageExpenseTypeButtons("savings-btn")
});


document.getElementById("dollar-btn").addEventListener("click", function() {
    manageCurrencyTypeButtons("dollar-btn")
});
document.getElementById("euro-btn").addEventListener("click", function() {
    manageCurrencyTypeButtons("euro-btn")
});
document.getElementById("crown-btn").addEventListener("click", function() {
    manageCurrencyTypeButtons("crown-btn")
});

