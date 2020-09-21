const Themer = function(color) {
    let combinations = [];
    let group = color.match(/.{1,2}/g);

    // TODO refactor this to a map function?
    let first  = group[0]+group[1]+group[2];
    let second = group[0]+group[2]+group[1];
    let third  = group[1]+group[0]+group[2];
    let fourth = group[1]+group[2]+group[0];
    let fifth  = group[2]+group[0]+group[1];
    let sixth  = group[2]+group[1]+group[0];

    combinations.push(first);
    combinations.push(second);
    combinations.push(third);
    combinations.push(fourth);
    combinations.push(fifth);
    combinations.push(sixth);

    return [...new Set(combinations)];
}

function complementaryColor(hexaRgbColor) {

    let color = hexaRgbColor.toString();

    if (typeof hexaRgbColor === 'number') {
        color = parseInt(hexaRgbColor).toString(16).padStart(6, "0");
    }

    if (hexaRgbColor.toString().slice(0,1) === '#') {
        color = hexaRgbColor.slice(1,hexaRgbColor.length);
    }

    if (color.length !== 3 && color.length !== 6){
        throw new Error('Color should be a 3 or 6 digits hexa');
    }

    if (color.length === 3) {
        color = color.split('').map(i => i.repeat(2)).join('');
    }

    color = 0xffffff ^ parseInt(color,16);
    color = color.toString(16);
    return '#'+color.padStart(6, '0');
}

function clearContainers() {
    document.querySelectorAll('.container').forEach(item => item.innerHTML = '');
}

function deriveColorsIntoContainer(color, container) {
    let derivedColors = Themer(color);

    derivedColors.map(item => {
        document.querySelector(container).innerHTML += '<div class="color-scheme" style="background-color:#'+item+'"><span>#'+item.toUpperCase()+'</span></div>';
    });
}

function copyToClipboardEvent() {
    document.querySelectorAll('.color-scheme').forEach(el => {
        el.addEventListener('click', function() {
            let text = el.innerText;
            try {
                navigator.clipboard.writeText(text).then(function() {
                    toastr.options = {
                        "closeButton": false,
                        "debug": false,
                        "newestOnTop": false,
                        "progressBar": false,
                        "positionClass": "toast-top-center",
                        "preventDuplicates": false,
                        "onclick": null,
                        "showDuration": "300",
                        "hideDuration": "500",
                        "timeOut": "2000",
                        "extendedTimeOut": "0",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    }

                    toastr["success"]("Código da cor copiado com sucesso!");

                }, function(err) {
                    console.error('Async: Could not copy text: ', err);
                });
            } catch (e) {
                alert('Seu navegador não suporta a API de copiar para a área de transferência! Por favor atualize seu navegador.');
            }
        });
    });
}

document.querySelector('#colorPicker').addEventListener('change', function(evt) {
    clearContainers();

    let colorRaw = evt.target.value;
    let color = colorRaw.slice(1, colorRaw.length);
    deriveColorsIntoContainer(color, '.c1');

    let complementaryRaw = complementaryColor(colorRaw);
    let complementary = complementaryRaw.slice(1, complementaryRaw.length);

    deriveColorsIntoContainer(complementary, '.c2');
    copyToClipboardEvent();
});

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
// addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
});
    // Update UI to notify the user they can add to home screen

addBtn.addEventListener('click', () => {
    // hide our user interface that shows our A2HS button
    // addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
    });
});


window.addEventListener('appinstalled', (evt) => {
    // Log install to analytics
    console.log('INSTALL: Success');
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}