const elements = document.querySelectorAll("tr");
for (const element of Array.from(elements)) {
	if (element.id) {
		const id = element.id;
		element.querySelector("td .disabled-btn").onclick = function () {this.innerText === "Enable" ? enable(id) : disable(id);};
		element.querySelector("td .block-btn").onclick = function () {this.innerText === "Block" ? block(id) : unblock(id);};
		element.querySelector("td .delete-btn").onclick = () => remove(id);
	}
}
const enable = (id) => {
	fetch(`/tokens/enable/${id}`);
	document.getElementById(id).querySelector("td .disabled-btn").innerText = "Disable";
	document.getElementById(id).querySelector("td .disabled").innerText = "Enabled";
	document.getElementById(id).querySelector("td .disabled-btn").classList.value = "btn btn-danger disabled-btn";
};
const disable = (id) => {
	fetch(`/tokens/disable/${id}`);
	document.getElementById(id).querySelector("td .disabled-btn").innerText = "Enable";
	document.getElementById(id).querySelector("td .disabled").innerText = "Disabled";
	document.getElementById(id).querySelector("td .disabled-btn").classList.value = "btn btn-success disabled-btn";
};
const block = (id) => {
	fetch(`/tokens/block/${id}`);
	document.getElementById(id).querySelector("td .block-btn").innerText = "Unblock";
	document.getElementById(id).querySelector("td .blocked").innerText = "Blocked"
	document.getElementById(id).querySelector("td .block-btn").classList.value = "btn btn-success block-btn";
};
const unblock = (id) => {
	fetch(`/tokens/unblock/${id}`);
	document.getElementById(id).querySelector("td .block-btn").innerText = "Block";
	document.getElementById(id).querySelector("td .blocked").innerText = "Unblocked"
	document.getElementById(id).querySelector("td .block-btn").classList.value = "btn btn-danger block-btn";
};
const remove = (id) => {
	fetch(`/tokens/delete/${id}`);
	document.getElementById(id).remove();
};
