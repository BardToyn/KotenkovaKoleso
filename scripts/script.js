const prizes = [
    {
        text: "Сделать сюрприз🎈",
        color: "hsl(197 30% 43%)",
    },

    { 
        text: "Внезапные объятия💕",
        color: "hsl(173 58% 39%)",
    },

    { 
        text: "Сделать чаёк☕",
        color: "hsl(43 74% 66%)",
    },

    {
        text: "Hot coffe😏",
        color: "hsl(27 87% 67%)",
    },

    {
        text: "Сделать массаж🤗",
        color: "hsl(12 76% 61%)",
    },

    {
        text: "Позвать гулять!!!🤠",
        color: "hsl(350 60% 52%)",
    }

];

const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");

const prizeSlice = 360 / prizes.length;
const prizeOffset = Math.floor(180 / prizes.length);
const spinClass = "is-spinning";
const selectedClass = "selected";
const spinnerStyles = window.getComputedStyle(spinner);

let tickerAnim;
let rotation = 0; // угол вращения
let currentSlice = 0; // текущий сектор
let prizeNodes; // переменная для текстовых подписей

// расставляем текст по секторам
const createPrizeNodes = () => {
    // обрабатываем каждую подпись
    prizes.forEach(({ text, color, reaction }, i) => {
        // каждой из них назначаем свой угол поворота
        const rotation = ((prizeSlice * i) * -1) - prizeOffset;
        // добавляем код с размещением текста на страницу в конец блока spinner
        spinner.insertAdjacentHTML(
            "beforeend",
            // текст при этом уже оформлен нужными стилями
            `<li class="prize" data-reaction=${reaction} style="--rotate: ${rotation}deg">
            <span class="text">${text}</span>
            </li>`
        );
    });
};

// рисуем разноцветные секторы
const createConicGradient = () => {
    // устанавливаем нужное значение стиля у элемента spinner
    spinner.setAttribute(
        "style",
        `background: conic-gradient(
            from -90deg,
            ${prizes
            // получаем цвет текущего сектора
            .map(({ color }, i) => `${color} 0 ${(100 / prizes.length) * (prizes.length - i)}%`)
            .reverse()
            }
        );`
    );
};

// создаём функцию, которая нарисует колесо в сборе
const setupWheel = () => {
    createConicGradient(); // сначала секторы
    createPrizeNodes(); // потом текст
    prizeNodes = wheel.querySelectorAll(".prize"); // а потом мы получим список всех призов на странице, чтобы работать с ними как с объектами
};

setupWheel(); // подготавливаем всё к первому запуску

// функция запуска вращения с плавной остановкой
const spinertia = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// отслеживаем нажатие на кнопку
trigger.addEventListener("click", () => {
    trigger.disabled = true; // делаем её недоступной для нажатия
    rotation = Math.floor(Math.random() * 360 + spinertia(2000, 5000)); // задаём начальное вращение колеса
    prizeNodes.forEach((prize) => prize.classList.remove(selectedClass)); // убираем прошлый приз
    wheel.classList.add(spinClass); // добавляем колесу класс is-spinning, с помощью которого реализуем нужную отрисовку
    spinner.style.setProperty("--rotate", rotation); // через CSS говорим секторам, как им повернуться
    ticker.style.animation = "none"; // возвращаем язычок в горизонтальную позицию
    runTickerAnimation();// запускаем анимацию вращение
});

// функция запуска вращения с плавной остановкой
const runTickerAnimation = () => {
    const values = spinnerStyles.transform.split("(")[1].split(")")[0].split(",");
    const a = values[0];
    const b = values[1];  
    let rad = Math.atan2(b, a);
    
    if (rad < 0) rad += (2 * Math.PI);
    
    const angle = Math.round(rad * (180 / Math.PI));
    const slice = Math.floor(angle / prizeSlice);

    if (currentSlice !== slice) {
    ticker.style.animation = "none";
    setTimeout(() => ticker.style.animation = null, 10);
        currentSlice = slice;
    }
    tickerAnim = requestAnimationFrame(runTickerAnimation);
};

// отслеживаем, когда закончилась анимация вращения колеса
spinner.addEventListener("transitionend", () => {
    cancelAnimationFrame(tickerAnim); // останавливаем отрисовку вращения
    rotation %= 360; // получаем текущее значение поворота колеса
    selectPrize(); // выбираем приз
    wheel.classList.remove(spinClass); // убираем класс, который отвечает за вращение
    spinner.style.setProperty("--rotate", rotation); // отправляем в CSS новое положение поворота колеса
    trigger.disabled = false; // делаем кнопку снова активной
});

const BOT_TOKEN = "7352860769:AAHTENYUddgMQGLY5BYw6rSTgzZVKFBBQKY";
const CHAT_ID = "824020353";

const sendMessageToTelegram = (message) => {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
        }),
    })
    .then((response) => {
        if (!response.ok) {
            console.error("Ошибка при отправке сообщения:", response.statusText);
        }
    })
    .catch((error) => console.error("Ошибка сети:", error));
};

const selectPrize = () => {
    const selected = Math.floor(rotation / prizeSlice);
    const prize = prizes[selected];

    prizeNodes[selected].classList.add(selectedClass);

    const message = `Тася выиграла: ${prize.text}`;
    sendMessageToTelegram(message);
};
