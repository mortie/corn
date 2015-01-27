corn.addView("other", ["index"], function(args, view)
{
	view.draw(view.template("index"));

	view.event("button", "click", function(e)
	{
		console.log(e);
	});
});
