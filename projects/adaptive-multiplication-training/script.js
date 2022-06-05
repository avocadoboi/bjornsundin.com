
const WEIGHT_CHANGE_SPEED = 0.5;
const GOOD_TIME = 1; // seconds

const problem_types = [
	{
		min: Number.parseInt(document.getElementById("min-multiplication").value),
		max: Number.parseInt(document.getElementById("max-multiplication").value),
		sign: "×",
		toggle_element: document.getElementById("multiplication-toggle"),
		calculate: (a, b) => a*b
	},
	{
		min: Number.parseInt(document.getElementById("min-division").value),
		max: Number.parseInt(document.getElementById("max-division").value),
		sign: "÷",
		toggle_element: document.getElementById("division-toggle"),
		calculate: (a, b) => a/b
	},
	{
		min: Number.parseInt(document.getElementById("min-addition").value),
		max: Number.parseInt(document.getElementById("max-addition").value),
		sign: "+",
		toggle_element: document.getElementById("addition-toggle"),
		calculate: (a, b) => a+b
	},
	{
		min: Number.parseInt(document.getElementById("min-subtraction").value),
		max: Number.parseInt(document.getElementById("max-subtraction").value),
		sign: "−",
		toggle_element: document.getElementById("subtraction-toggle"),
		calculate: (a, b) => a-b
	}
];

function create_weights() {
	let weights = [];

	for (let type of problem_types.filter(t => t.toggle_element.checked)) 
	{
		for (let left_number = type.min; left_number <= type.max; ++left_number) 
		{
			for (let right_number = type.min; right_number <= type.max; ++right_number)
			{
				if (type.calculate(left_number, right_number) % 1 != 0) {
					continue;
				}
				weights.push({
					left_number,
					right_number,
					type,
					weight: 1
				});
			}
		}
	}

	return weights;
}

let weights = [];

let problem;
let problem_start_time;

function select_problem() {
	const weight_sum = weights.map(a => a.weight).reduce((a, b) => a + b, 0);
	const value = Math.random()*weight_sum;

	let sum = 0;
	for (let problem of weights) {
		sum += problem.weight;
		if (value < sum) {
			return problem;
		}
	}
}

let problem_text = document.getElementById("problem");
let answer_input = document.getElementById("answer");

function update_problem_text() {
	problem_text.innerText = problem.left_number + problem.type.sign + problem.right_number + " = ";
}

document.getElementById("start-button").addEventListener("click", () => {
	document.getElementById("options").style.display = "none";
	document.getElementById("quiz-area").style.display = "initial";
	weights = create_weights();
	problem = select_problem();
	problem_start_time = new Date().getTime();
	update_problem_text();
});

function update_problem(failed) {
	let weight = failed ? problem.weight*2 : (new Date().getTime() - problem_start_time)/(GOOD_TIME*1000);
	problem.weight += (weight - problem.weight)*WEIGHT_CHANGE_SPEED;
	problem = select_problem();
	update_problem_text();
	answer_input.value = "";
	problem_start_time = new Date().getTime();
}

answer_input.onkeydown = (e) => {
	return e.key != '.' && e.key != ',';
};

const feedback_div = document.getElementById("feedback-container");

function add_feedback(expected, failed) {
	const content = `${problem.left_number}${problem.type.sign}${problem.right_number} = ${answer_input.value} ${failed ? "<span class='cross'>❌</span>" : "<span class='green'>✔</span>"}`;
	feedback_div.innerHTML = `<p class='feedback'>${content}</p>` + feedback_div.innerHTML;
	if (feedback_div.children.length > 3) {
		feedback_div.removeChild(feedback_div.lastChild);
	}
}

answer_input.addEventListener("input", (e) => {	
	const expected = problem.type.calculate(problem.left_number, problem.right_number);
	if (Number.parseInt(answer_input.value) == expected) {
		add_feedback(expected, false);
		update_problem(false);
	}
	else if (answer_input.value.length == Math.floor(1 + Math.log10(expected))) {
		add_feedback(expected, true);
		update_problem(true);
	}
});
