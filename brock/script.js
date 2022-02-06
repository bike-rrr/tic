// working as of Sunday -> but if online discount is in other discount, doesnt work
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input').forEach(item => {
        item.onclick = () => {
        }
    })
    // set Local Storage **done on form submit**
    // TODO => on keyUP, so we always keep track
    // if (localStorage.getItem('inputValues')) {
    //     document.querySelectorAll("input").forEach(field => {
    //         const data = JSON.parse(localStorage.getItem("inputValues"));
    //         field.value = data[field.id]
    //     })
    // }
})

// format all input fields with a decimal
const fields = document.querySelectorAll('input').forEach(field => {
    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    field.onkeyup = () => {
        chars = field.value
        let digits = "";

        for (let i = 0; i < chars.length; i++) {
            if (nums.includes(parseInt(chars[i]))) {
                digits += chars[i];
            }
        }

        let len = digits.length;
        if (len > 0 && len <= 2) {
            field.value = "." + digits;
        }
        else if (len > 2) {
            field.value = digits.substring(0, len - 2) + "." + digits[len - 2] + digits[len - 1]
        }
    }
})

const form = document.querySelector("#form");

form.onsubmit = () => {
    // make sure required fields are fill out
    let inputEmpty = false;
    document.querySelectorAll('input.required').forEach(item => {
        if (item.value == "") {
            console.log("hi")
            inputEmpty = true;
        }
    })
    if (inputEmpty) {
        return;
    }

    // make sure if other discounts is left blank, it doesnt become NaN, so that we dont subtract NaN from anyting to yield, NaN elsewhere
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        if (!input.value) {
            input.value = 0;
        }
    })

    // clear out previous table
    let table = document.querySelector('table');

    if (table.rows.length != 0) {
        // delete Thead...delteting all rows causes everything to delete after resubmit
        document.querySelector('table').deleteTHead();
    }

    const subTotal = parseFloat(form.subTotal.value);
    const onlineDiscount = parseFloat(form.onlineDiscount.value);
    const otherDiscounts = parseFloat(form.otherDiscounts.value);
    // const taxAmount = parseFloat(form.taxAmount.value);
    const originalTotal = parseFloat(form.originalTotal.value);

    // calculate tax rate -> taxRate = taxAmount / (subtotal - discounts)
    // let taxRate = ((taxAmount / (subTotal - onlineDiscount - otherDiscounts)) + 1);
    // taxRate = taxRate.toFixed(5)
    // console.log(taxRate)
    taxRate = 1.0975;

    // setLocal Storage while were here
    const inputValues = {
        subTotal,
        onlineDiscount,
        otherDiscounts,
        taxAmount: parseFloat(form.taxAmount.value),
        originalTotal
    }
    try {
        localStorage.setItem("inputValues", "teeeest");
    } catch (error) {
        document.body.innerHTML = error;
    }


    // if theres discount PLUS a coupon, the TAX is calculated from sub - discount, and THEN the coupon is taken off
    //.. so maybe need input field for coupon, and IF coupon PLUS another discount, tax is calculated from sub - disc and then copon is applied.

    // get delivery charge, so this work for orders with delivery charges > $4.00..
    const part1 = (subTotal - (onlineDiscount + otherDiscounts))
    const part2 = part1 * taxRate;
    const delCharge = parseFloat((originalTotal - part2).toFixed(1));
    console.log(delCharge)

    let zones = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0,]
    const values = [];
    let offset = 0; // if original deliver charge is not $4, we need  offset to add to zones, so they start at the correct zone.

    // get correct array of zones aka -> 4.5, 5.0, 5.5 or -> 5.0, 5.5, 6.0 ect if original DC is not === $4.00
    for (let i = 0; i < zones.length; i++) {
        if (zones[i] === 4) {
            console.log("zone 1")
            break;
        }
        else {
            if (zones[i] === delCharge) {
                console.log("equal")
                zones = zones.splice(i + 1)
                offset = i + 1;
            }
        }
    }

    function calculate() {
        zones.forEach((zone, index) => {

            const amount = originalTotal - parseFloat(zone);
            const a = amount / taxRate;
            const totalDiscount = a - subTotal;
            const additional = totalDiscount + (onlineDiscount + otherDiscounts);

            // check if correct with total Discount
            const bb = subTotal + parseFloat(totalDiscount);
            const cc = bb * parseFloat(taxRate)
            if ((cc + zone).toFixed(2) != originalTotal) {
                console.log(zone, "no")
            }

            // check additional numbers
            const bbb = (subTotal + parseFloat(additional)) - (onlineDiscount + otherDiscounts);
            const ccc = bbb * parseFloat(taxRate)
            if ((ccc + zone).toFixed(2) != originalTotal) {
                console.log("nope", index, "fuck", (ccc + zone), originalTotal)
            }

            const data = {
                Zone: index + 2 + offset,
                Delivery_Charge: `$ ${parseFloat(zone).toFixed(2)}`,
                Total_Discount: `$ ${totalDiscount.toFixed(2)}`,
                Additional_Discount: `$ ${additional.toFixed(2)}`
            }
            values.push(data)
        })

        // make table
        let data = Object.keys(values[0])

        let table = document.querySelector('table');

        function makeTableHead(table) {
            let thead = table.createTHead();
            let row = thead.insertRow();
            for (let key of data) {

                key = key.replace("_", "\n")
                let th = document.createElement('th');
                let text = document.createTextNode(key);
                th.appendChild(text);
                row.appendChild(th)
            }
        }

        function generateTable(table, values) {
            let i = 0;
            for (let element of values) {
                let row = table.insertRow();

                for (key in element) {
                    let cell = row.insertCell();
                    i % 2 === 0 ? cell.style.backgroundColor = "lightgrey" : cell.style.backgroundColor = "lightblue";
                    let text = document.createTextNode(element[key]);
                    cell.appendChild(text);
                    cell.onclick = () => {
                        if (cell.style.color === "black") {
                            cell.style.color = "red"
                        } else {
                            cell.style.color = "black"
                        }
                    }
                }
                i++;
            }
            window.scroll({
                top: 500,
                behavior: 'smooth'
            });
        }

        makeTableHead(table)
        generateTable(table, values)
    }
    calculate();
    return false;
}

document.querySelector("#clear").onclick = () => {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.querySelector("table").innerHTML = "";
}



