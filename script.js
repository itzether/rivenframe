let rivens; // Riven List

let table_rows = document.querySelectorAll('tbody tr'),
table_headings = document.querySelectorAll('thead th');

function locateTable(){
    table_rows = document.querySelectorAll('tbody tr'),
    table_headings = document.querySelectorAll('thead th');
}

async function fetchData(){ // Function to fetch all Riven data
    try {
        const response = await fetch("https://www-static.warframe.com/repos/weeklyRivensPC.json");
    
        if (!response.ok){
            throw new Error("Could not fetch resource");
        }    

        rivens = await response.json();
        rivens.forEach(element => {
            if (element.rerolled === true) {
                element.rerolled = 'Rerolled'
            } else {
                element.rerolled = 'Original'
            }

            if (!element.compatibility) {
                element.compatibility = `Unassigned ${element.itemType}`
            }
        });
    }

    catch(error){
        console.error(error);
    }
}

async function displayRivens(){
    await new Promise(r => setTimeout(r, 20));
    await fetchData();

    if (rivens) {
        let cardsData = document.querySelector('.cards-data');

        cardsData.innerHTML = '';

        rivens.forEach(element => console.log(element.compatibility + " (Rerolled: " + element.rerolled+ ") - " + element.avg + "pl"));
        rivens.forEach(element => document.querySelector('.cards-data').innerHTML += 
                        `<tr id="${element.compatibility}${element.rerolled}">
                            <td id="weapon-title" data-cell="Weapon" onclick="displayData('${element.compatibility}${element.rerolled}')">${element.compatibility}</td>
                            <td class="weapon-content" data-cell="Type">${element.itemType}</td>
                            <td class="weapon-content" data-cell="Reroll">${element.rerolled}</td>
                            <td class="weapon-content" data-cell="Minimum">${element.min}</td>
                            <td class="weapon-content" data-cell="Average">${element.avg}</td>
                            <td class="weapon-content" data-cell="Maximum">${element.max}</td>
                            <td class="weapon-content" data-cell="Median">${element.median}</td>
                            <td class="weapon-content" data-cell="Standard Deviation">${element.stddev}</td>
                            <td class="weapon-content" data-cell="Popularity">${element.pop}</td>
                        </tr>`
        );
    } else {
        console.error('Rivens still empty');
    }

    locateTable();
    toggleLoader();
    sortTable(0, true) // Defaults sorting to Weapon name
    colorRows(); // Coloring odd rows a different color for readability
}

let filtered = false;
function filterTable(){
    let search = document.querySelector('#searchBar').value;
    
    if (!search) {
        filtered = false;
        table_rows.forEach(row => {
            row.classList.remove('displayOff');
        })
    } else {
        filtered = true;
        table_rows.forEach(row => {
            let rowName = (row.id.replace("Rerolled", "")).replace("Original", "");
            if (!rowName.toLowerCase().includes(search.toLowerCase())) {
                row.classList.add('displayOff');
            } else {
                row.classList.remove('displayOff');
            }
        }); 
    }

    colorRows();
}

function colorRows(){
    let visibleRows = document.querySelectorAll('tbody tr:not(.displayOff)')

    for (let x = 0; x < visibleRows.length; x++){
        if (x % 2 != 0){ 
            visibleRows[x].classList.add('oddRow');
        } else { 
            visibleRows[x].classList.remove('oddRow');
        }
    }
}

function displayData(weapon) {
    let weaponChildren = document.getElementById(weapon).children; 

    for (let element of weaponChildren){
        if (element.id != "weapon-title"){
            element.classList.toggle('weapon-content')
        }
    }
}

// Sorting system
table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        table_headings.forEach(head => head.classList.remove('active'));
        head.classList.add('active');

        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        table_rows.forEach(row => {
            row.querySelectorAll('td')[i].classList.add('active');
        })

        head.classList.toggle('dec', sort_asc);
        sort_asc = head.classList.contains('dec') ? false : true;

        sortTable(i, sort_asc);
    }
})


function sortTable(column, sort_asc) {
    [...table_rows].sort((a, b) => {
        let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
            second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

        return sort_asc ? ( first_row.localeCompare(second_row, undefined, {numeric: true, sensitivity: 'base'}) > 0 ? 1 : -1) : ( second_row.localeCompare(first_row, undefined, {numeric: true, sensitivity: 'base'}) < 0 ? -1 : 1);
    })
        .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
}

// Loader

function toggleLoader () {
    const loader = document.querySelector(".loader");

    loader.classList.toggle("loader-hidden");

    //loader.addEventListener("transitionend", () => {
    //    document.body.removeChild(".loader")
    //})
}

// Onload

displayRivens()