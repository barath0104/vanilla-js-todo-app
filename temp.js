// temp.js

function makeCard(task) {

  const card = document.createElement('div')

  card.className  = 'task-card'
  card.draggable  = true
  card.dataset.id = task.id

  card.style.height    = ITEM_HEIGHT + 'px'
  card.style.boxSizing = 'border-box'

  const textEl = document.createElement('div')

  textEl.className   = 'task-text'
  textEl.textContent = task.text

  const btnGroup = document.createElement('div')
  btnGroup.className = 'btn-group'

  const editBtn = document.createElement('button')

  editBtn.className   = 'btn-edit'
  editBtn.textContent = '✎'
  editBtn.title       = 'Edit task'

  editBtn.addEventListener('click', function(e) {
    e.stopPropagation()
    openEditModal(task)
  })

  const delBtn = document.createElement('button')

  delBtn.className   = 'btn-del'
  delBtn.textContent = '×'
  delBtn.title       = 'Delete task'

  delBtn.addEventListener('click', function(e) {
    e.stopPropagation()
    deleteTask(task.id)
  })

  card.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('taskId', task.id)
    card.classList.add('dragging')
  })

  card.addEventListener('dragend', function() {
    card.classList.remove('dragging')
  })

  btnGroup.appendChild(editBtn)
  btnGroup.appendChild(delBtn)

  card.appendChild(textEl)
  card.appendChild(btnGroup)

  return card
}