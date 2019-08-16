var input_sleepLength = document.getElementById("input_sleepLength");
input_sleepLength.value = "08:58";
input_sleepLength.oninput = function () { updateResult(); }

var input_wakeUpTime = document.getElementById("input_wakeUpTime");
input_wakeUpTime.value = "07:01";
input_wakeUpTime.oninput = function () { updateResult(); }

var text_result = document.getElementById("text_result");

function updateResult() {
    if (input_wakeUpTime.value == "" ||
        input_sleepLength.value == "") return;
    var wakeUpHour = parseInt(input_wakeUpTime.value.substring(0, 2)),
        wakeUpMinute = parseInt(input_wakeUpTime.value.substring(3, 5)),
        sleepHours = parseInt(input_sleepLength.value.substring(0, 2)),
        sleepMinutes = parseInt(input_sleepLength.value.substring(3, 5)),
        hours = wakeUpHour - sleepHours,
        minutes = wakeUpMinute - sleepMinutes;
    if (minutes < 0) hours-- , minutes += 60;
    if (hours < 0) hours += 24;
    text_result.innerText = "You should sleep " + ("0" + hours).slice(-2) + ':' + ("0" + minutes).slice(-2);
}