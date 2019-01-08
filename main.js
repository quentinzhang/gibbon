var code_mode = 0;
$(function() {
	setTimeout(function(){
		var edit_img = chrome.extension.getURL('edit_butt.png');
		$("div[id=js_toolbar_1]").prepend("<div class='btn-outter edui-box edui-button edui-for-html edui-default'><a href='javascript:;' id='editsource' title='编辑源代码' class='js_tooltip'><img src='"+edit_img+"'/></a></div>");
		$("#edui1_iframeholder").before("<div id='sourcewin'><textarea id='sourcewintxt'></textarea></div>");
		var editor = CodeMirror.fromTextArea(document.getElementById("sourcewintxt"), {
			lineNumbers: true,
			mode: "htmlmixed",
			lineWrapping: true,
			viewportMargin: Infinity,
		});
		$("#sourcewin").hide();

		CodeMirror.defineExtension("autoFormatRange", function (from, to) {
		    var cm = this;
		    var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
		    var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
		    var tabSize = cm.getOption("tabSize");

		    var out = "", lines = 0, atSol = from.ch == 0;
		    function newline() {
		        out += "\n";
		        atSol = true;
		        ++lines;
		    }

		    for (var i = 0; i < text.length; ++i) {
		        var stream = new CodeMirror.StringStream(text[i], tabSize);
		        while (!stream.eol()) {
		            var inner = CodeMirror.innerMode(outer, state);
		            var style = outer.token(stream, state), cur = stream.current();
		            stream.start = stream.pos;
		            if (!atSol || /\S/.test(cur)) {
		                out += cur;
		                atSol = false;
		            }
		            if (!atSol && inner.mode.newlineAfterToken &&
		                inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i+1] || "", inner.state))
		                newline();
		        }
		        if (!stream.pos && outer.blankLine) outer.blankLine(state);
		        if (!atSol) newline();
		    }

		    cm.operation(function () {
		        cm.replaceRange(out, from, to);
		        for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
		            cm.indentLine(cur, "smart");
		    });
		});

		// Applies automatic mode-aware indentation to the specified range
		CodeMirror.defineExtension("autoIndentRange", function (from, to) {
		    var cmInstance = this;
		    this.operation(function () {
		        for (var i = from.line; i <= to.line; i++) {
		            cmInstance.indentLine(i, "smart");
		        }
		    });
		});

	    editor.on('change', updateTextArea);

	    $(".CodeMirror-lines").on('click', function() {
	    	$("#edui1_toolbar_mask").hide();
	    });

		$("#editsource").on('click', function() {
			if(!code_mode) {
				console.log("converted to code mode")
				var originHtml = $('iframe#ueditor_0').contents().find("body").html();
				$("#sourcewin").show();
				$('#edui1_iframeholder').hide();
				$("#editsource").addClass("wrapped");
				$("#sourcewintxt").html(originHtml);
				editor.setValue(originHtml);
				var totalLines = editor.lineCount();  
				editor.autoFormatRange({line:0, ch:0}, {line:totalLines});
				code_mode = 1;
			} else {
				console.log("converted to normal mode")
				updateTextArea();
				$("#sourcewin").hide();
				$('#edui1_iframeholder').show();
				$("#editsource").removeClass("wrapped");
				code_mode = 0;
			}
		})

	    $(document).on('click', '.appmsg_item, .first_appmsg_item', function(){
			console.log("clicked menu item");
			//var changedHtml = $("#sourcewintxt").val();
			//changedHtml = cleanCode(changedHtml);
			$("#sourcewin").hide();
			$('#edui1_iframeholder').show();
			$("#editsource").removeClass("wrapped");
			code_mode = 0;    	
	    })

	    function updateTextArea() {
	        editor.save();
			var changedHtml = $("#sourcewintxt").val();
			changedHtml = cleanCode(changedHtml);
			console.log(changedHtml);
			$('iframe#ueditor_0').contents().find("body").html(changedHtml);
	    }

	    function cleanCode(parentHTML) {
	        //parentHTML = parentHTML.replace( new RegExp( "\>[\s]+\<" , "g" ) , "><" );
	        parentHTML = parentHTML.replace(/(<(pre|script|style|textarea)[^]+?<\/\2)|(^|>)\s+|\s+(?=<|$)/g, "$1$3");

	        return parentHTML;
	    }

	},200)	
});