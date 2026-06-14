const worryInput = document.querySelector("#worryInput");
const flipButton = document.querySelector("#flipButton");
const buttonText = document.querySelector("#buttonText");
const spinner = document.querySelector("#spinner");
const counter = document.querySelector("#counter");
const inputPanel = document.querySelector("#inputPanel");
const resultPanel = document.querySelector("#resultPanel");
const finalPanel = document.querySelector("#finalPanel");
const benefitsList = document.querySelector("#benefitsList");
const nextStepText = document.querySelector("#nextStepText");
const flipLineText = document.querySelector("#flipLineText");
const finalLineText = document.querySelector("#finalLineText");
const cardButton = document.querySelector("#cardButton");
const newButton = document.querySelector("#newButton");
const finalNewButton = document.querySelector("#finalNewButton");
const historyButton = document.querySelector("#historyButton");
const historyDialog = document.querySelector("#historyDialog");
const closeHistoryButton = document.querySelector("#closeHistoryButton");
const historyList = document.querySelector("#historyList");

const storageKey = "fanmian.records.v1";
let currentRecord = null;

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function setRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records.slice(0, 80)));
}

function saveRecord(record) {
  const records = getRecords();
  setRecords([record, ...records.filter((item) => item.id !== record.id)]);
}

function setLoading(isLoading) {
  flipButton.disabled = isLoading;
  flipButton.classList.toggle("loading", isLoading);
  spinner.hidden = !isLoading;
  buttonText.textContent = isLoading ? "正在翻面" : "翻面";
}

function renderResult(result, worry) {
  inputPanel.classList.add("hidden");
  benefitsList.innerHTML = "";
  result.benefits.forEach((benefit) => {
    const li = document.createElement("li");
    li.textContent = benefit;
    benefitsList.appendChild(li);
  });
  nextStepText.textContent = result.nextStep;
  flipLineText.textContent = result.flipLine;
  finalLineText.textContent = result.flipLine;

  currentRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    worry,
    response: result,
  };
  saveRecord(currentRecord);

  document.body.dataset.view = "analysis";
  finalPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({ block: "start", behavior: "smooth" });
}

async function flipWorry() {
  const worry = worryInput.value.trim();
  if (!worry) {
    worryInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/flip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ worry }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "翻面失败");
    renderResult(data, worry);
  } catch (error) {
    renderResult(
      {
        mode: "demo",
        benefits: [
          "这次请求没有成功，但这也帮我们发现：试用版需要更稳定的网络和模型配置。",
          "你的烦心事已经被保留下来了，等服务恢复后可以再试一次。",
        ],
        nextStep: error.message,
        flipLine: "产品也会翻车，修好它就是下一面。",
      },
      worry
    );
  } finally {
    setLoading(false);
  }
}

function resetInput() {
  inputPanel.classList.remove("hidden");
  resultPanel.classList.add("hidden");
  finalPanel.classList.add("hidden");
  worryInput.value = "";
  counter.textContent = "0/800";
  document.body.dataset.view = "input";
  inputPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  setTimeout(() => worryInput.focus(), 220);
}

function showFinal() {
  if (!currentRecord) return;
  document.body.dataset.view = "final";
  resultPanel.classList.add("hidden");
  finalPanel.classList.remove("hidden");
  finalPanel.scrollIntoView({ block: "start", behavior: "smooth" });
}

function renderHistory() {
  const records = getRecords();
  historyList.innerHTML = "";
  if (!records.length) {
    const empty = document.createElement("p");
    empty.textContent = "还没有试用记录。";
    historyList.appendChild(empty);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement("article");
    item.className = "history-item";
    const title = document.createElement("strong");
    title.textContent = new Date(record.createdAt).toLocaleDateString("zh-CN", {
      month: "long",
      day: "numeric",
    });
    const worry = document.createElement("p");
    worry.textContent = `烦心事：${record.worry}`;
    const flip = document.createElement("p");
    flip.textContent = `翻面：${record.response.flipLine}`;
    item.append(title, worry, flip);
    historyList.appendChild(item);
  });
}

worryInput.addEventListener("input", () => {
  counter.textContent = `${worryInput.value.length}/800`;
});

flipButton.addEventListener("click", flipWorry);
newButton.addEventListener("click", resetInput);
finalNewButton.addEventListener("click", resetInput);
cardButton.addEventListener("click", showFinal);
historyButton.addEventListener("click", () => {
  renderHistory();
  historyDialog.showModal();
});
closeHistoryButton.addEventListener("click", () => historyDialog.close());

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    worryInput.value = button.dataset.sample;
    counter.textContent = `${worryInput.value.length}/800`;
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
