const ARRAY_LENGTH = 200000;
const BENCHMARK_TIME = 1;

//=======================================================================================================

var gpu = new GPU();

var getMultiplied_GPU = gpu.createKernel(
    function (numbers_0, numbers_1) {
        return numbers_0[this.thread.x] * numbers_1[this.thread.x];
    }
).setOutput([ARRAY_LENGTH]);

var getNewArray_GPU = gpu.createKernel(
    function () {
        return this.thread.x;
    }
).setOutput([ARRAY_LENGTH]);

function performBenchmark_GPU() {
    let time_before = performance.now();
    let numberOfIterations = 0;
    do {
        getMultiplied_GPU(getNewArray_GPU(), getNewArray_GPU());
        numberOfIterations++;
    } while (performance.now() - time_before < BENCHMARK_TIME * 1000);
    document.write("GPU iterations/second: " + numberOfIterations);
}

//=======================================================================================================

var getMultiplied_CPU = function (numbers_0, numbers_1) {
    let result = [];
    for (let a = 0; a < ARRAY_LENGTH; a++) {
        result.push(numbers_0[a] * numbers_1[a]);
    }
    return result;
}

var getNewArray_CPU = function () {
    let result = [];
    for (let a = 0; a < ARRAY_LENGTH; a++) {
        result.push(a);
    }
    return result;
}

function performBenchmark_CPU() {
    let time_before = performance.now();
    let numberOfIterations = 0;
    do {
        getMultiplied_CPU(getNewArray_CPU(), getNewArray_CPU());
        numberOfIterations++;
    } while (performance.now() - time_before < BENCHMARK_TIME * 1000);
    document.write("CPU iterations/second: " + numberOfIterations);
}

//=======================================================================================================

performBenchmark_GPU();
document.write("<br>")
performBenchmark_CPU();