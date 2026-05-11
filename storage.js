// storage.js
function saveTasks() {

  localStorage.setItem(
    'tasks',
    JSON.stringify(Object.values(taskMap))
  )
}

function loadTasks() {

  const saved = JSON.parse(localStorage.getItem('tasks')) || []

  saved.forEach(function(task) {

    task.textLower = task.text.toLowerCase()

    taskMap[task.id] = task

    colMap[task.column].add(task.id)

    colArrayCache[task.column].push(task.id)
  })
}