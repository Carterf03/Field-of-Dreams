const header = document.querySelector('header');
const menuToggle = document.getElementById('menuToggle');

const toggleSpan = menuToggle.querySelector('span');
menuToggle.addEventListener('click', () => {
    header.classList.toggle('menu-hidden');

    if (header.classList.contains('menu-hidden')) {
        toggleSpan.textContent = '+';
    } else {
        toggleSpan.textContent = '−';
    }
});

const footer = document.querySelector('footer');
const fMenuToggle = document.getElementById('fMenuToggle');

const fToggleSpan = fMenuToggle.querySelector('span');
if(fMenuToggle){
    fMenuToggle.addEventListener('click', () => {
        footer.classList.toggle('menu-hidden');
    
        if (footer.classList.contains('menu-hidden')) {
            fToggleSpan.textContent = '+';
        } else {
            fToggleSpan.textContent = '−';
        }
    });
}
