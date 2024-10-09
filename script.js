let timer;
let timeLeft;
let isRunning = false;
let initialTime;

const timeSlider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const startButton = document.getElementById('startButton');
const endEarlyButton = document.getElementById('endEarlyButton');
const resetButton = document.getElementById('resetButton');
const taskType = document.getElementById('taskType');
const customTaskType = document.getElementById('customTaskType');
const deleteTaskTypeButton = document.getElementById('deleteTaskType');
const recordTable = document.getElementById('recordTable');
const exportButton = document.getElementById('exportButton');

const customInputContainer = document.querySelector('.custom-input-container');

timeSlider.addEventListener('input', updateTimeDisplay);
startButton.addEventListener('click', toggleTimer);
endEarlyButton.addEventListener('click', endEarly);
resetButton.addEventListener('click', resetTimer);
taskType.addEventListener('change', toggleCustomTaskType);
customTaskType.addEventListener('keypress', handleCustomTaskTypeInput);
deleteTaskTypeButton.addEventListener('click', deleteCurrentTaskType);
exportButton.addEventListener('click', exportToCSV);

function toggleCustomTaskType() {
    if (taskType.value === '自定义') {
        taskType.style.display = 'none';
        customInputContainer.style.display = 'block';
        customTaskType.style.display = 'block';
        customTaskType.focus();
        deleteTaskTypeButton.style.display = 'none';
    } else {
        taskType.style.display = 'block';
        customInputContainer.style.display = 'none';
        customTaskType.style.display = 'none';
        deleteTaskTypeButton.style.display = 'block';
    }
}

function handleCustomTaskTypeInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const newTaskType = customTaskType.value.trim();
        if (newTaskType) {
            addNewTaskType(newTaskType);
            customTaskType.value = '';
            customInputContainer.style.display = 'none';
            toggleCustomTaskType(); // 添加这行来更新UI状态
        }
    }
}

function addNewTaskType(newType) {
    const option = document.createElement('option');
    option.value = newType;
    option.textContent = newType;
    taskType.insertBefore(option, taskType.lastElementChild);
    taskType.value = newType;
    deleteTaskTypeButton.style.display = 'inline-block'; // 添加这行来显示删除按钮
}

function deleteCurrentTaskType() {
    const currentValue = taskType.value;
    if (currentValue !== '自定义' && taskType.options.length > 1) {
        for (let i = 0; i < taskType.options.length; i++) {
            if (taskType.options[i].value === currentValue) {
                taskType.remove(i);
                break;
            }
        }
        taskType.value = taskType.options[0].value;
    }
    toggleCustomTaskType(); // 确保UI状态正确更新
}

function updateTimeDisplay() {
    const minutes = timeSlider.value;
    timeDisplay.textContent = `${minutes}:00`;
    timerDisplay.textContent = `${minutes}:00`;
    timeLeft = minutes * 60;
    initialTime = timeLeft;
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timer);
        startButton.textContent = '继续';
        isRunning = false;
    } else {
        startTimer();
        startButton.textContent = '暂停';
        isRunning = true;
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            endTimer();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endTimer() {
    clearInterval(timer);
    isRunning = false;
    startButton.textContent = '开始';
    alert('专注时间结束！');
    addRecord(true);
    resetTimer();
}

function endEarly() {
    if (isRunning || timeLeft < initialTime) {
        clearInterval(timer);
        isRunning = false;
        startButton.textContent = '开始';
        confirmEndEarly();
    }
}

function confirmEndEarly() {
    if (confirm('确定要提前结束吗？')) {
        alert('专注时间提前结束');
        addRecord(false);
        resetTimer();
    } else {
        // 如果用户取消，恢复计时器
        if (timeLeft < initialTime) {
            startTimer();
            startButton.textContent = '暂停';
            isRunning = true;
        }
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startButton.textContent = '开始';
    timeLeft = initialTime;
    updateTimerDisplay();
}

function addRecord(completed) {
    const actualSeconds = initialTime - timeLeft;
    const actualMinutes = Math.floor(actualSeconds / 60);
    const remainingSeconds = actualSeconds % 60;
    const row = recordTableBody.insertRow(0);
    row.insertCell(0).textContent = taskType.value;
    row.insertCell(1).textContent = `${Math.round(initialTime / 60)}:00`;
    row.insertCell(2).textContent = `${actualMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    row.insertCell(3).textContent = completed ? '是' : '否';

    const deleteCell = row.insertCell(4);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'delete-record-button';
    deleteButton.addEventListener('click', () => deleteRecord(row));
    deleteCell.appendChild(deleteButton);
}

function deleteRecord(row) {
    if (confirm('确定要删除这条记录吗？')) {
        recordTableBody.removeChild(row);
    }
}

function exportToCSV() {
    let csvContent = "数据:,类型,设定时间,实际时间,是否完成\n";

    const rows = recordTableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const rowData = Array.from(cells).slice(0, 4).map(cell => cell.textContent); // 只取前4列
        csvContent += `${i + 1},${rowData.join(',')}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "专注记录.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

updateTimeDisplay();
toggleCustomTaskType(); // 初始化自定义类型输入框的显示状态

deleteTaskTypeButton.style.display = 'block'; // 初始时显示删除按钮

deleteTaskTypeButton.addEventListener('click', deleteCurrentTaskType);

const recordTableBody = recordTable.querySelector('tbody');

// 在文件末尾添加以下代码

const reviews = [
    {
        name: "chc",
        username: "@chc",
        body: "Fake it till you make it",
        img: "/chchchchc1023.github.io/images/touxiang.jpg", // 修改路径
    },
    {
        name: "mzl",
        username: "@mzl",
        body: "那咋了",
        img: "images/mzltouxiang.jpg", // 修改路径
    },
    {
        name: "John",
        username: "@john",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Jane",
        username: "@jane",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Jenny",
        username: "@jenny",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "James",
        username: "@james",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/james",
    },
];

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    card.innerHTML = `
        <div class="review-header">
            <img src="${review.img}" alt="${review.name}" onerror="this.onerror=null; this.src='https://avatar.vercel.sh/${review.name}';">
            <div>
                <div class="review-name">${review.name}</div>
                <div class="review-username">${review.username}</div>
            </div>
        </div>
        <div class="review-body">${review.body}</div>
    `;
    return card;
}

function populateMarquee() {
    const rows = document.querySelectorAll('.marquee-row');

    reviews.forEach((review, index) => {
        rows[index % 2].appendChild(createReviewCard(review));
    });

    // 复制卡片以实现无缝滚动
    rows.forEach(row => {
        const cards = row.innerHTML;
        row.innerHTML = cards + cards;
    });
}

populateMarquee();
