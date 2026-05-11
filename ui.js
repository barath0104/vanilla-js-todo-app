const DOM = {

  searchInput: document.getElementById('searchInput'),

  addForm: document.getElementById('addForm'),

  newTaskText: document.getElementById('newTaskText'),

  newTaskCol: document.getElementById('newTaskCol'),

  btnShowAdd: document.getElementById('btnShowAdd'),

  btnSave: document.getElementById('btnSave'),

  btnCancel: document.getElementById('btnCancel'),

  editModal: document.getElementById('editModal'),

  editInput: document.getElementById('editInput'),

  editCol: document.getElementById('editCol'),

  btnEditSave: document.getElementById('btnEditSave'),

  btnEditCancel: document.getElementById('btnEditCancel'),

  cols: Object.fromEntries(

    COLS.map(function(col) {

      return [col, {

        area: document.getElementById('cards-' + col),

        count: document.getElementById('cnt-' + col),

        colEl: document.getElementById('col-' + col)
      }]
    })
  )
}


function updateCount(col) {

  DOM.cols[col].count.textContent = colMap[col].size
}


function virtualRender(col, taskIds) {

  const area = DOM.cols[col].area

  const scrollTop = scrollState[col]

  const totalItems = taskIds.length

  const rawStart = Math.floor(scrollTop / ITEM_HEIGHT)

  const startIndex = Math.max(0, rawStart - BUFFER)

  const endIndex = Math.min(
    totalItems,
    rawStart + VISIBLE_COUNT + BUFFER
  )

  const paddingTop = startIndex * ITEM_HEIGHT

  const paddingBottom = Math.max(
    0,
    (totalItems - endIndex) * ITEM_HEIGHT
  )

  const visibleIds = taskIds.slice(startIndex, endIndex)

  requestAnimationFrame(function() {

    area.innerHTML = ''

    if (totalItems === 0) {

      area.style.paddingTop = '0px'

      area.style.paddingBottom = '0px'

      const empty = document.createElement('div')

      empty.className = 'empty-state'

      empty.textContent = DOM.searchInput.value.trim()
        ? 'No matches'
        : 'Drop tasks here'

      area.appendChild(empty)

      return
    }

    area.style.paddingTop = paddingTop + 'px'

    area.style.paddingBottom = paddingBottom + 'px'

    const frag = document.createDocumentFragment()

    visibleIds.forEach(function(id) {

      frag.appendChild(makeCard(taskMap[id]))
    })

    area.appendChild(frag)

    updateCount(col)
  })
}

function renderColumn(col) {

  const query = DOM.searchInput.value.toLowerCase().trim()

  let taskIds = colArrayCache[col]

  if (query) {

    taskIds = taskIds.filter(function(id) {

      return taskMap[id].textLower.includes(query)
    })
  }

  virtualRender(col, taskIds)
}


function renderAll() {

  COLS.forEach(function(col) {

    renderColumn(col)
  })
}


function setupScrollListeners() {

  COLS.forEach(function(col) {

    const area = DOM.cols[col].area

    area.style.height = (VISIBLE_COUNT * ITEM_HEIGHT) + 'px'

    area.style.overflowY = 'auto'

    area.addEventListener('scroll', function() {

      scrollState[col] = area.scrollTop

      renderColumn(col)
    })
  })
}


DOM.btnEditSave.addEventListener('click', saveEdit)

DOM.btnEditCancel.addEventListener('click', closeEditModal)

DOM.editInput.addEventListener('keydown', function(e) {

  if (e.key === 'Enter') saveEdit()

  if (e.key === 'Escape') closeEditModal()
})


DOM.editModal.addEventListener('click', function(e) {

  if (e.target === DOM.editModal) {

    closeEditModal()
  }
})


COLS.forEach(function(col) {

  const colEl = DOM.cols[col].colEl

  colEl.addEventListener('dragover', function(e) {

    e.preventDefault()

    colEl.classList.add('drag-over')
  })

  colEl.addEventListener('dragleave', function(e) {

    if (!colEl.contains(e.relatedTarget)) {

      colEl.classList.remove('drag-over')
    }
  })

  colEl.addEventListener('drop', function(e) {

    e.preventDefault()

    colEl.classList.remove('drag-over')

    const id = parseInt(
      e.dataTransfer.getData('taskId')
    )

    moveTask(id, col)
  })
})


DOM.searchInput.addEventListener('input', function() {

  requestAnimationFrame(function() {

    renderAll()
  })
})


DOM.btnShowAdd.addEventListener('click', function() {

  DOM.addForm.classList.toggle('open')
})


DOM.btnCancel.addEventListener('click', function() {

  DOM.addForm.classList.remove('open')

  DOM.newTaskText.value = ''
})


DOM.btnSave.addEventListener('click', addTask)


DOM.newTaskText.addEventListener('keydown', function(e) {

  if (e.key === 'Enter') addTask()

  if (e.key === 'Escape') DOM.btnCancel.click()
})


loadTasks()

setupScrollListeners()

renderAll()