const
	elements = document.querySelectorAll("tr"),
	baseClasses = "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full font-medium",
	badClasses = "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
	goodClasses = "bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500";
for (const element of Array.from(elements)) {
	if (element.id) {
		const id = element.id;
		// element.querySelector("td .disable").onclick = function () {this.innerText === "Enable" ? enable(id) : disable(id);};
		element.querySelector("td .delete").onclick = () => remove(id);
	}
}
const enable = id => {
	fetch(`/users/enable/${id}`);
	document.getElementById(id).querySelector("td .disable").innerText = "Disable";
	document.getElementById(id).querySelector("td .e-text").innerText = "Enabled";
	document.getElementById(id).querySelector("td .e-text").classList.value = `${baseClasses} ${goodClasses} e-text`;
};
const disable = id => {
	fetch(`/users/disable/${id}`);
	document.getElementById(id).querySelector("td .disable").innerText = "Enable";
	document.getElementById(id).querySelector("td .e-text").innerText = "Disabled";
	document.getElementById(id).querySelector("td .e-text").classList.value = `${baseClasses} ${badClasses} e-text`;
};
const remove = id => {
	fetch(`/users/delete/${id}`);
	document.getElementById(id).remove();
};
