window.corn = new Spat(
{
	"element": document.getElementById("view"),
	"defaultView": "home",
	"viewDir": "view",
	"requestPrefix": "api/"
});

corn.loadViews(
[
	"home",
	"other"
]);
