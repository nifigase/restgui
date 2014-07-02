
var request_js_config = {
	root_url: "",
	root_url_in_qs: false,
	crossdomain: false,
	services_jsdls: {},
	service_groups_list: [],
	loaded_templates: {}
};

function get_template(name) {
	if (name in request_js_config.loaded_templates) {
		return request_js_config.loaded_templates[name];
	}
	var el = $("#"+name);
	var v = (el !== undefined && el.html() != "") ? 
		el.html() :
		$.ajax({
			type: "GET",
			url: "/static/templates/" + name + ".txt",
			async: false
		}).responseText;
	request_js_config.loaded_templates[name] = v;
	return v;
}

function update_result(str) 
{
    var d = $("#resultDiv");
    d.css("display", "block");
    d.html("<pre>" + str + "</pre>"); 
    window.scrollTo(0, d.offset().top);
}

function get_param_hash(servname, opname, paramname)
{
	var op = request_js_config.services_jsdls[servname]["operations"][opname];
	return _.find(op.parameters, function(value, index) { return (value['name'] == paramname); });
}

function check_string(servname, opname, paramname, paramvalue)
{
	var param_hash = get_param_hash(servname, opname, paramname);
	if (param_hash === undefined) {
		return true;
	}
	if (param_hash.pattern !== undefined)
	{
		var re = new RegExp(param_hash.pattern);
		if (paramvalue.match(re) == null)
		{
			alert("Parameter " + paramname + " must match the pattern '" + param_hash.pattern + "'");
			return false;
		}
	}
	return true;
}

function check_number(servname, opname, paramname, paramvalue)
{
	var op = request_js_config.services_jsdls[servname]["operations"][opname];
	var param_hash = _.find(op.parameters, function(value, index) { return (value['name'] == paramname); });
	if (param_hash === undefined) {
		return true;
	}
	if (param_hash.minimum !== undefined && paramvalue < param_hash.minimum)
	{
		alert("Parameter " + paramname + " must be >= " + param_hash.minimum);
		return false;
	}
	if (param_hash.maximum !== undefined && paramvalue > param_hash.maximum)
	{
		alert("Parameter " + paramname + " must be <= " + param_hash.maximum);
		return false;
	}
	return true;
}

function make_form_request(servname, opname)
{
	console.log("make_form_request: servname=" + servname + ", opname=" + opname);
	var formid = 'form_' + servname + '_' + opname;
	var form = $("#"+formid);
	var op = request_js_config.services_jsdls[servname]["operations"][opname];
    
	var qstr_params = {};
    var pos_args = [];
    var raw_arg = null;

    function add_arg(name, value) {
    	var param_hash = _.find(op.parameters, function(value, index) { return (value['name'] == name); });
    	if (param_hash === undefined) {
    		return;
    	}
    	if (value == "" && "default" in param_hash) {
    		value = param_hash["default"];
    	}
    	if ("passing" in param_hash && param_hash.passing == "raw") {
    		raw_arg = value;
		}
    	else if ("passing" in param_hash && param_hash.passing == "positional") {
    		pos_args.push(escape(value));
    	} else {
    		var k = escape(name).replace(/\+/g, "%2B");
	        qstr_params[k] = escape(value ? value : "").replace(/\+/g, "%2B");
    	}
    }
    
    function handle_elem(element)
    {
    	var plainTags = ["TEXT", "TEXTAREA", "PASSWORD", "BUTTON", "RESET", "SUBMIT", "IMAGE", "HIDDEN"];
    	var elemName = element.name;
    	
    	console.log("handle_elem: name = " + elemName);
    	
    	if (elemName == undefined || elemName == '')
    		return;
    	var elemType = element.type.toUpperCase();
    	if (plainTags.indexOf(elemType) != -1)
    		add_arg(elemName, element.value);
    	else if (elemType == "CHECKBOX" && element.checked)
    		add_arg(elemName, element.value ? element.value : "On");
    	else if (elemType == "RADIO" && element.checked)
    		add_arg(elemName, element.value);
    	else if (elemType.indexOf("SELECT") != -1) {
    		for (var j = 0; j < element.options.length; j++) {
    			var option = element.options[j];
    			if (option.selected)
    				add_arg(elemName, option.value ? option.value : option.text);
    		}
    	}
    }
    
    form.find("input,select,textarea").each(function(i) { handle_elem($(this)[0]); });
    
    var url = request_js_config.root_url + op.target;
    
    if (pos_args.length > 0) {
    	url += pos_args.join("/");
    }
    console.log("url: " + url + ", qstr_params=" + qstr_params + ", type=" + op.transport.toUpperCase());
    
    var data = {
		type: op.transport.toUpperCase(),
		crossDomain: request_js_config.crossdomain,
		contentType: "application/json",
		context: document.body,
		statusCode: {
	        404: function() { update_result("Entity is not found"); },
	        403: function() { update_result("Operation is forbidden"); }
	    }
    }
    	
    if (raw_arg != null) {
    	data.url = url + "?" + $.param(qstr_params);
    	data.data = raw_arg;
    	data.contentType = 'text/text; charset=UTF-8';
	} else {
    	data.url = url;
    	data.data = qstr_params;
    }
    
    update_result("Processing...");
    
    $.ajax(data)
    	.done(function(s) { update_result(s); })
    	.fail(function(e) {
	        update_result("Error requesting " + url + ": " + e.responseText);
			console.dir(e);
    	});
    
	return false;
}

function render_service(name, jsdl)
{
	console.log('Service: ' + name + ": " + Object.keys(jsdl.operations).length + " ops");
	
	var form_template = get_template("form_template");
	var param_template = get_template("param_template");
	
	var data = "";
	for (var opname in jsdl.operations)
	{
		var op = jsdl.operations[opname];
		var str = _.template(form_template, 
			{param_template: param_template, servname: name, opname: opname, op: op});
		console.log(str);
		data += str;
	}
	return data;
}

tv4.addSchema('JSONSchema', JSONSchema)
tv4.addSchema('ParamJSONSchema', ParamJSONSchema)

function jsdls_loaded(data)
{
	console.log("jsdls_loaded: " + data);
	for (var n in request_js_config.service_groups_list) 
	{
		var service_group = request_js_config.service_groups_list[n];
		
		$('body').append("<h3>" + service_group.description + "</h3>");
		
		for (i in service_group.services)
		{
			var name = service_group.services[i];
			var jsdl_pair = _.find(data, function(value, index) { return (value[0] == name); });
	    	if (jsdl_pair === undefined) {
	    		continue;
	    	}
	    	
			var jsdl = jsdl_pair[1];
			
			var valid = tv4.validate(jsdl, jsdl_schema);
	
			if (!valid) {
				alert("Validation of JSDL for " + name + " service failed: " + tv4.error.message + 
					" at " + tv4.error.dataPath);
			}
			request_js_config.services_jsdls[name] = jsdl;
			$('body').append(render_service(name, jsdl));
		}
	}
}

function service_groups_loaded(data)
{
	request_js_config.service_groups_list = data;
	$.ajax({
		url: request_js_config.root_url + "/jsdls",
		type: "get",
		dataType: "json",
		crossDomain: request_js_config.crossdomain,
		contentType: "application/json",
		context: document.body
	})
	.done(jsdls_loaded)
	.fail(function(e) {
        update_result("Error requesting jsdls: " + e.message);
		console.dir(e);
	});;
}

$(document).ready(function() {
	
	if (request_js_config.root_url_in_qs) {
		if ("root_url" in $.QueryString) {
			request_js_config.root_url = $.QueryString["root_url"].replace(/\/+$/,'');
			if (request_js_config.root_url.search("://") == -1) {
				request_js_config.root_url = "http://" + request_js_config.root_url;
			}
			console.log("Root URL set to " + request_js_config.root_url);
		}
		if (request_js_config.root_url == "") {
			$('body').append("<p>Please select API URL</p>");
			return;
		}
	}
	
	var url = request_js_config.root_url + "/service_groups";
	console.log("service_groups URL set to " + url);
	$.ajax({
		url: url,
		type: "get",
		dataType: "json",
		crossDomain: request_js_config.crossdomain,
		contentType: "application/json",
		context: document.body,
		statusCode: {
	        404: function(){
	            update_result("URL " + url + " is not found");
	        }
	    }
	})
	.done(service_groups_loaded)
	.fail(function(e) {
        update_result("Error requesting service_groups: " + e.message);
		console.dir(e);
	});
});
