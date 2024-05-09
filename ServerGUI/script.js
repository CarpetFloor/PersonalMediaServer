let running = true;
function toggle() {
    console.log("toggle");

    running = !(running);

    if(running) {
        document.getElementById("toggle").innerText = "◼";
        document.getElementById("toggle").style.color = "#cfcfcf"
        document.getElementById("toggle").style.backgroundColor = "#2b2bca";

        document.getElementsByClassName("portContainer")[0].style.color = "whitesmoke";
        document.getElementsByClassName("portContainer")[0].children[1].innerText = "31415";
    }
    else {
        document.getElementById("toggle").innerText = "▶";
        document.getElementById("toggle").style.color = "white";
        document.getElementById("toggle").style.backgroundColor = "#39cc87";

        document.getElementsByClassName("portContainer")[0].style.color = "grey ";

        document.getElementsByClassName("portContainer")[0].children[1].innerText = "NOT RUNNING";
    }
}

function goToMedia() {
    console.log("go to media");
}