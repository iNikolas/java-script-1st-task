const createEntryBtn = document.querySelector("#createEntryBtn");
const mainTable = document.querySelector("#table-body-main");
const mainTableDataForm = document.querySelector("#main-table-data-form");
const headerControlButtons = document.querySelector("#header-control-buttons");
const archiveTable = document.querySelector("#table-body-archive");

const deleteIcon = "./pictures/deleteIcon.png";
const editIcon = "./pictures/editIcon.png";
const archiveIcon = "./pictures/archiveIcon.png";
const mainTableIcon = "./pictures/mainTableIcon.png";

const CATEGORIES = ["Task", "Random Thought", "Idea"];
const EDITABLE_FIELDS = ["name", "category", "content"];
let view = "main";

let tableValues = [
  {
    name: "Shopping List",
    created: "Apr 20, 2021",
    category: "Task",
    content: "tomatoes, bread",
    dates: "15.12.2012",
  },
  {
    name: "New feature",
    created: "May 05, 2021",
    category: "Idea",
    content: "Make modal popups",
    dates: "",
  },
  {
    name: "Old feature",
    created: "Feb 25, 2021",
    category: "Random Thought",
    content: "Old feature 18.12.2021 better new twos 17.11.1019",
    dates: "",
  },
];

let archivedValues = [];
let statisticValues = {};

function calculateStatistic(e) {
  //  "This try/catch structure is unnecessary here, I had used the try/catch structure according to the task
  //  requirements. I'm catching an error here which occurs when I'm trying to utilize e.target check at my very first
  //  application load which normally demands updating the statistics. So instead of using the optional chaining
  //  operator, I'm redirecting my execution flow directly to the catch block. To stay consistent any other predictable
  //  statistic updates also are being sent to the catch block where they are being normally handled."
  try {
    if (["delete", "archive", "edit"].includes(e.target.dataset.action))
      throw new Error();
  } catch (error) {
    statisticValues = {};
    CATEGORIES.forEach((category) => {
      let mainCounter = 0;
      let archiveCounter = 0;
      tableValues.forEach((value) => {
        if (value.category === category) mainCounter++;
      });
      archivedValues.forEach((value) => {
        if (value.category === category) archiveCounter++;
      });
      if (mainCounter | archiveCounter)
        statisticValues[category] = { mainCounter, archiveCounter };
    });
    appendStatisticEntries(statisticValues);
  }
}

function appendStatisticEntries(statisticValues) {
  archiveTable.innerHTML = null;
  let index = 0;
  for (const statisticValue in statisticValues) {
    const newTableRow = document.createElement("tr");
    const tdCaption = document.createElement("td");
    const inputCaption = document.createElement("input");

    tdCaption.append(inputCaption);
    inputCaption.name = statisticValue;
    inputCaption.type = "text";
    inputCaption.disabled = true;
    inputCaption.value = statisticValue;

    newTableRow.append(tdCaption);
    for (const statistic in statisticValues[statisticValue]) {
      const td = document.createElement("td");
      createInputElem(td, statistic, index++, statisticValues[statisticValue]);
      newTableRow.append(td);
    }
    archiveTable.append(newTableRow);
  }
}

appendButtons(headerControlButtons, "thead");
appendEntries(tableValues);
calculateStatistic();

createEntryBtn.addEventListener("click", () => {
  createNewEntry();
  appendEntries(tableValues);
  switchToMainView();
});
headerControlButtons.addEventListener("click", handleHeaderBtnClick);
mainTableDataForm.addEventListener("click", calculateStatistic);

function createNewEntry() {
  const entryData = {};
  const date = dateStamp();
  entryData.name = "";
  entryData.created = `${date.monthAndDay},${date.year}`;
  entryData.category = CATEGORIES[0];
  entryData.content = "";
  entryData.dates = "";

  tableValues.push(entryData);
}

function appendEntries(targetValues, action = "for main table") {
  mainTable.innerHTML = null;
  targetValues.forEach((tableEntry, index) => {
    const newTableRow = document.createElement("tr");
    if (action === "for archive table") {
      newTableRow.addEventListener("click", handleArchiveBtnClick);
    } else if (action === "for main table") {
      newTableRow.addEventListener("click", handleBtnClick);
    }
    for (const cell in tableEntry) {
      const td = document.createElement("td");
      if (cell === "category") {
        createSelectElem(td, cell, index, tableEntry);
      } else {
        createInputElem(td, cell, index, tableEntry);
      }
      newTableRow.append(td);
    }
    const actionsTd = document.createElement("td");
    if (action === "for archive table") {
      appendButtons(actionsTd, "thead");
    } else {
      appendButtons(actionsTd);
    }
    newTableRow.append(actionsTd);
    mainTable.append(newTableRow);
  });
}

function createSelectElem(parentNode, cell, index, tableEntry) {
  const select = document.createElement("select");
  parentNode.append(select);
  select.name = `${cell}_${index}`;
  select.disabled = true;
  CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    if (category === tableEntry.category) {
      option.selected = true;
    }
    select.append(option);
  });
}

function createInputElem(parentNode, cell, index, tableEntry) {
  const input = document.createElement("input");
  parentNode.append(input);
  input.name = `${cell}_${index}`;
  input.type = "text";
  input.disabled = true;
  input.value = tableEntry[cell];
}

function dateStamp() {
  return new Date()
    .toDateString()
    .matchAll(/(?<monthAndDay>\w{3} \d{2})(?<year> \d{4})/g)
    .next().value.groups;
}

function appendButtons(td, target = "tbody") {
  const deleteBtn = document.createElement("img");
  deleteBtn.src = deleteIcon;
  deleteBtn.className = "action-btn";
  deleteBtn.dataset.action = "delete";

  const archiveBtn = document.createElement("img");
  archiveBtn.src = archiveIcon;
  archiveBtn.className = "action-btn";
  archiveBtn.dataset.action = "archive";

  td.prepend(deleteBtn);
  td.prepend(archiveBtn);

  if (target === "tbody") {
    const editBtn = document.createElement("img");
    editBtn.src = editIcon;
    editBtn.className = "action-btn";
    editBtn.dataset.action = "edit";
    td.prepend(editBtn);
  }
}

function handleBtnClick(e) {
  if (e.target.dataset.action === "delete") removeEntry(e.currentTarget);
  if (e.target.dataset.action === "archive") archiveEntry(e.currentTarget);
  if (e.target.dataset.action === "edit") toggleEditMode(e.currentTarget);
}

function handleArchiveBtnClick(e) {
  if (e.target.dataset.action === "delete")
    removeEntry(e.currentTarget, "archive");
  if (e.target.dataset.action === "archive") unarchiveEntry(e.currentTarget);
}

function handleHeaderBtnClick(e) {
  if (e.target.dataset.action === "delete")
    removeAllEntries(view === "main" ? "for main table" : "for archive table");
  if (e.target.dataset.action === "archive") toggleView();
}

function toggleView() {
  if (view === "main") appendEntries(archivedValues, "for archive table");
  if (view === "archive") appendEntries(tableValues);
  view === "main" ? switchToArchiveView() : switchToMainView();
}

function switchToMainView() {
  view = "main";
  headerControlButtons.querySelectorAll(".action-btn")[0].src = archiveIcon;
}

function switchToArchiveView() {
  view = "archive";
  headerControlButtons.querySelectorAll(".action-btn")[0].src = mainTableIcon;
}

function removeEntry(tr, action = "main") {
  const rowId = tr.rowIndex - 1;
  if (action === "main") {
    tableValues = tableValues.filter((_, index) => index !== rowId);
    appendEntries(tableValues);
  } else if (action === "archive") {
    archivedValues = archivedValues.filter((_, index) => index !== rowId);
    appendEntries(archivedValues, "for archive table");
  }
}

function removeAllEntries(action = "for main table") {
  if (action === "for main table") {
    tableValues = [];
    appendEntries(tableValues);
  } else if (action === "for archive table") {
    archivedValues = [];
    appendEntries(archivedValues, "for archive table");
  }
}

function archiveEntry(tr) {
  const rowId = tr.rowIndex - 1;
  archivedValues.push(tableValues[rowId]);
  tableValues = tableValues.filter((_, index) => index !== rowId);
  appendEntries(tableValues);
}

function unarchiveEntry(tr) {
  const rowId = tr.rowIndex - 1;
  tableValues.push(archivedValues[rowId]);
  archivedValues = archivedValues.filter((_, index) => index !== rowId);
  appendEntries(archivedValues, "for archive table");
}

function toggleEditMode(tr) {
  const tableRowCells = tr.querySelectorAll("td");
  const rowId = tr.rowIndex - 1;
  if (!tableRowCells[0].children[0].disabled) {
    handleTableChangeData(rowId);
  }
  for (let i = 0; i < tableRowCells.length - 1; i++) {
    if (
      EDITABLE_FIELDS.includes(
        tableRowCells[i].children[0].name.replace(/_\d+/g, "")
      )
    ) {
      tableRowCells[i].children[0].disabled =
        !tableRowCells[i].children[0].disabled;
    }
  }
}

function handleTableChangeData(rowId) {
  const formData = new FormData(mainTableDataForm);
  const content = formData.get(`content_${rowId}`);

  tableValues[rowId] = {
    ...tableValues[rowId],
    ...{
      name: formData.get(`name_${rowId}`),
      category: formData.get(`category_${rowId}`),
      content,
      dates: extractDateInfo(content),
    },
  };
  appendEntries(tableValues);
}

function extractDateInfo(fieldText) {
  const result = fieldText.match(/\d{1,2}[.,/\\]\d{1,2}[.,/\\]\d{2,4}/g);
  return result
    ? result.reduce((accumulator, value, index, array) => {
        const prefix = index === array.length - 1 ? "." : ", ";
        return accumulator + value + prefix;
      }, "")
    : "";
}
