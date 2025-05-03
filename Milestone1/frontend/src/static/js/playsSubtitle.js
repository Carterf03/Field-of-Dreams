const role = sessionStorage.getItem("role");
const subtitle = document.getElementById("subtitle");
if (role === "player") {
    subtitle.textContent = "Tap any play to view";
} else if (role === "coach") {
    subtitle.textContent = "Tap any play to edit";
}