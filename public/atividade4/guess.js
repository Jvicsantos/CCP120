// ===== guess.js =====

// Gera número aleatório entre 1 e 50
const randomNumber = Math.floor(Math.random() * 50) + 1;

const input = document.getElementById("guess-number");
const button = document.getElementById("check-btn");
const feedback = document.getElementById("feedback");

let attempts = 0; // contador de tentativas

button.addEventListener("click", () => {
  const userGuess = Number(input.value);
  attempts++;

  // Limpa cor e mensagem antiga
  input.style.backgroundColor = "white";
  feedback.style.color = "#333";

  if (!userGuess || userGuess < 1 || userGuess > 50) {
    feedback.textContent = "⚠️ Digite um número válido entre 1 e 50.";
    feedback.style.color = "orange";
    return;
  }

  if (userGuess === randomNumber) {
    feedback.textContent = `🎉 Parabéns! Você acertou em ${attempts} tentativa(s)!`;
    feedback.style.color = "green";
    input.style.backgroundColor = "#b2f2bb";
    button.disabled = true;
  } else if (userGuess > randomNumber) {
    feedback.textContent = "🔻 O número é menor. Tente novamente!";
    feedback.style.color = "red";
    input.style.backgroundColor = "#ffc9c9";
  } else {
    feedback.textContent = "🔺 O número é maior. Tente novamente!";
    feedback.style.color = "red";
    input.style.backgroundColor = "#ffc9c9";
  }

  input.value = "";
  input.focus();
});
