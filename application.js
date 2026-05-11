// application.js


// CONSTANTS

const COLS          = ['todo', 'ongoing', 'completed', 'drop']
const ITEM_HEIGHT   = 56
const VISIBLE_COUNT = 10
const BUFFER        = 3
const MAX_LENGTH    = 200


// DATA STRUCTURES

let taskMap = {}

let colMap = {
  todo:      new Set(),
  ongoing:   new Set(),
  completed: new Set(),
  drop:      new Set()
}

let colArrayCache = {
  todo:      [],
  ongoing:   [],
  completed: [],
  drop:      []
}

let scrollState = {
  todo:      0,
  ongoing:   0,
  completed: 0,
  drop:      0
}

let editingId = null


// ADD TASK

function addTask() {

  const text = DOM.newTaskText.value.trim()

  if (!text) return

  if (text.length > MAX_LENGTH) {

    alert('Too long! Max ' + MAX_LENGTH + ' chars.')
    return
  }

  const col = DOM.newTaskCol.value

  const task = {
    id:        Date.now(),
    text:      text,
    textLower: text.toLowerCase(),
    column:    col
  }

  taskMap[task.id] = task

  colMap[col].add(task.id)

  colArrayCache[col].push(task.id)

  DOM.newTaskText.value = ''

  DOM.addForm.classList.remove('open')

  saveTasks()

  requestAnimationFrame(function() {
    renderColumn(col)
  })
}


// DELETE TASK

function deleteTask(id) {

  const task = taskMap[id]

  if (!task) return

  const col = task.column

  const idx =
    colArrayCache[col].indexOf(id)

  delete taskMap[id]

  colMap[col].delete(id)

  if (idx !== -1) {
    colArrayCache[col].splice(idx, 1)
  }

  saveTasks()

  requestAnimationFrame(function() {
    renderColumn(col)
  })
}


// MOVE TASK

function moveTask(id, newCol) {

  const task = taskMap[id]

  if (!task) return

  const oldCol = task.column

  if (oldCol === newCol) return

  const idx =
    colArrayCache[oldCol].indexOf(id)

  colMap[oldCol].delete(id)

  if (idx !== -1) {
    colArrayCache[oldCol].splice(idx, 1)
  }

  task.column = newCol

  colMap[newCol].add(id)

  colArrayCache[newCol].push(id)

  saveTasks()

  requestAnimationFrame(function() {
    renderColumn(oldCol)
    renderColumn(newCol)
  })
}


// SAVE EDIT

function saveEdit() {

  const newText =
    DOM.editInput.value.trim()

  if (!newText) return

  if (newText.length > MAX_LENGTH) {

    alert('Too long! Max ' + MAX_LENGTH + ' chars.')
    return
  }

  const newCol = DOM.editCol.value

  const task = taskMap[editingId]

  const oldCol = task.column

  task.text      = newText
  task.textLower = newText.toLowerCase()

  if (oldCol !== newCol) {

    moveTask(editingId, newCol)

  } else {

    saveTasks()

    requestAnimationFrame(function() {
      renderColumn(oldCol)
    })
  }

  closeEditModal()
}