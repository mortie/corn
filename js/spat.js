(function()
{
	function request(url, method, data, cb)
	{
		var xhr = new XMLHttpRequest();
		xhr.onload = function()
		{
			if (xhr.status === 200)
				cb(xhr.responseText);
			else
				throw new Error(xhr.status+": "+xhr.statusText+" ("+url+")");
		}
		xhr.open(method, url);
		xhr.send(data);
	}

	function get(url, cb)
	{
		request(url, "get", null, cb);
	}

	function post(url, data, cb)
	{
		request(url, "post", data, cb);
	}

	function Async(num, cb)
	{
		return function()
		{
			--num;
			if (num <= 0) cb();
		}
	}

	window.Spat = function(options)
	{
		options = options || {};

		this.defaultView = options.defaultView || "home";
		this._viewsDir = options.viewsDir || "views";
		this._element = options.element || document.getElementById("view");

		this._views = {};
		this._path = window.location.hash.substring(1);

		function viewChangeHandler()
		{
			this._path = window.location.hash.substring(1);
			if (this._path !== "")
				this.load(this._path);
		}

		window.addEventListener("popstate", viewChangeHandler.bind(this));
		window.addEventListener("load", viewChangeHandler.bind(this));
	}
	window.Spat.prototype =
	{
		"addView": function(name, templates, cb)
		{
			var view = new View(
				name,
				templates,
				this._element,
				this._viewsDir,
				cb
			);

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
				console.log("View not found: "+path);
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
		this._element = element;

		this.templatesLoaded = false;
		this._templateCache = {};

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
		},

		"post": post,

		"get": get,

		"Async": Async
	}
})();
