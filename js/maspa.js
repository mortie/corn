(function()
{
	function get(url, cb)
	{
		var xhr = new XMLHttpRequest();
		xhr.onload = function()
		{
			cb(xhr.responseText);
		}
		xhr.open("get", url);
		xhr.send();
	}

	function Async(num, cb)
	{
		return function()
		{
			--num;
			if (num <= 0) cb();
		}
	}

	window.Maspa = function(defaultView, element, viewsDir)
	{
		this.defaultView = defaultView;
		this._viewsDir = viewsDir || "views"
		this._views = {};
		this._path = window.location.hash.substring(1);
		this._element = element;

		window.addEventListener("popstate", function(e)
		{
			this._path = window.location.hash.substring(1);
			this.load(this._path);
		}.bind(this));

		window.addEventListener("load", function(e)
		{
			this._path = window.location.hash.substring(1);
			this.load(this._path);
		}.bind(this));
	}
	window.Maspa.prototype =
	{
		"addView": function(name, templates, cb)
		{
			var view = new View(name, templates, this._element, this._viewsDir, cb);
			this._views[name] = view;

			if (this._path == "" && name == this.defaultView)
				this.load(name);
		},

		"loadViews": function(names)
		{
			names.forEach(function(name)
			{
				var s = document.createElement("script");
				s.type = "text/javascript";
				s.src = this._viewsDir+"/"+name+"/index.js";
				document.body.appendChild(s);
			}.bind(this));
		},

		"load": function(path)
		{
			var tokens = path.split("/");
			var view = this._views[tokens[0]];

			if (!view)
			{
				console.log("View not found: "+tokens[0]);
				return;
			}

			if (view.templatesLoaded)
			{
				view.cb(tokens, view);
			}
			else
			{
				view.ontemplatesloaded = function()
				{
					view.cb(tokens, view);
				}
			}
		}
	}

	var View = function(name, templates, element, viewsDir, cb)
	{
		this.name = name;
		this.cb = cb;
		this.templatesLoaded = false;
		this._templateCache = {};
		this._element = element;

		//do things once all templates are loaded
		var async = Async(templates.length, function()
		{
			this.templatesLoaded = true;
			if (this.ontemplatesloaded)
				this.ontemplatesloaded();
		}.bind(this));

		//load all templates
		templates.forEach(function(template)
		{
			get(viewsDir+"/"+name+"/templates/"+template+".html", function(res)
			{
				this._templateCache[template] = res;
				async();
			}.bind(this));
		}.bind(this));
	}
	View.prototype =
	{
		"template": function(name, args)
		{
			var template = this._templateCache[name];
			if (template === undefined)
				throw new Error("No such template!");

			if (args)
			{
				for (var i in args)
				{
					template = template.split("{{"+i+"}}").join(args[i]);
				}
			}

			return template;
		},

		"draw": function(str)
		{
			this._element.innerHTML = str;
		},

		"event": function(q, evt, cb)
		{
			var elems = this._element.querySelectorAll(q);
			for (var i in elems)
			{
				var elem = elems[i];
				if (!(elem instanceof Node))
					break;

				elem.addEventListener(evt, cb, false);
			}
		}
	}
})();
