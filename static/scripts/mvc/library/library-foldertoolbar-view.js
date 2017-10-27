define("mvc/library/library-foldertoolbar-view",["exports","layout/masthead","utils/utils","libs/toastr","mvc/library/library-model","mvc/ui/ui-select","libs/jquery/jstree"],function(e,t,i,a,o,s,l){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(e,"__esModule",{value:!0});r(t);var n=r(i),d=r(a),c=r(o),p=r(s),h=(r(l),Backbone.View.extend({el:"#center",events:{"click #toolbtn_create_folder":"createFolderFromModal","click #toolbtn_bulk_import":"modalBulkImport","click #include_deleted_datasets_chk":"checkIncludeDeleted","click #toolbtn_bulk_delete":"deleteSelectedItems","click .toolbtn-show-locinfo":"showLocInfo","click .page_size_prompt":"showPageSizePrompt"},defaults:{can_add_library_item:!1,contains_file_or_folder:!1,chain_call_control:{total_number:0,failed_number:0},disabled_jstree_element:"folders"},modal:null,jstree:null,histories:null,select_genome:null,select_extension:null,list_extensions:[],auto:{id:"auto",text:"Auto-detect",description:"This system will try to detect the file type automatically. If your file is not detected properly as one of the known formats, it most likely means that it has some format problems (e.g., different number of columns on different rows). You can still coerce the system to set your data to the format you think it should be. You can also upload compressed files, which will automatically be decompressed."},list_genomes:[],initialize:function(e){this.options=_.defaults(e||{},this.defaults),this.fetchExtAndGenomes(),this.render()},render:function(e){this.options=_.extend(this.options,e);var t=this.templateToolBar(),i={id:this.options.id,is_admin:!1,is_anonym:!0,mutiple_add_dataset_options:!1};Galaxy.user&&(i.is_admin=Galaxy.user.isAdmin(),i.is_anonym=Galaxy.user.isAnonymous(),null===Galaxy.config.user_library_import_dir&&!1===Galaxy.config.allow_library_path_paste&&null===Galaxy.config.library_import_dir||(i.mutiple_add_dataset_options=!0)),this.$el.html(t(i))},renderPaginator:function(e){this.options=_.extend(this.options,e);var t=this.templatePaginator();$("body").find(".folder-paginator").html(t({id:this.options.id,show_page:parseInt(this.options.show_page),page_count:parseInt(this.options.page_count),total_items_count:this.options.total_items_count,items_shown:this.options.items_shown}))},configureElements:function(e){this.options=_.extend(this.options,e),!0===this.options.can_add_library_item?$(".add-library-items").show():$(".add-library-items").hide(),!0===this.options.contains_file_or_folder&&Galaxy.user?Galaxy.user.isAnonymous()?($(".dataset-manipulation").show(),$(".logged-dataset-manipulation").hide()):($(".logged-dataset-manipulation").show(),$(".dataset-manipulation").show()):($(".logged-dataset-manipulation").hide(),$(".dataset-manipulation").hide()),this.$el.find("[data-toggle]").tooltip()},createFolderFromModal:function(e){e.preventDefault(),e.stopPropagation();var t=this,i=this.templateNewFolderInModal();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Create New Folder",body:i(),buttons:{Create:function(){t.create_new_folder_event()},Close:function(){Galaxy.modal.hide()}}})},create_new_folder_event:function(){var e=this.serialize_new_folder();if(this.validate_new_folder(e)){var t,i=new c.default.FolderAsModel,a=Backbone.history.fragment.split("/");t=a.indexOf("page")>-1?a[a.length-3]:a[a.length-1],i.url=i.urlRoot+t,i.save(e,{success:function(e){Galaxy.modal.hide(),d.default.success("Folder created."),e.set({type:"folder"}),Galaxy.libraries.folderListView.collection.add(e)},error:function(e,t){Galaxy.modal.hide(),void 0!==t.responseJSON?d.default.error(t.responseJSON.err_msg):d.default.error("An error occurred.")}})}else d.default.error("Folder's name is missing.");return!1},serialize_new_folder:function(){return{name:$("input[name='Name']").val(),description:$("input[name='Description']").val()}},validate_new_folder:function(e){return""!==e.name},modalBulkImport:function(){if(0===this.findCheckedRows().length)d.default.info("You must select some datasets first.");else{var e=this;this.histories=new c.default.GalaxyHistories,this.histories.fetch().done(function(){var t=e.templateBulkImportInModal();e.modal=Galaxy.modal,e.modal.show({closing_events:!0,title:"Import into History",body:t({histories:e.histories.models}),buttons:{Import:function(){e.importAllIntoHistory()},Close:function(){Galaxy.modal.hide()}}})}).fail(function(e,t){void 0!==t.responseJSON?d.default.error(t.responseJSON.err_msg):d.default.error("An error occurred.")})}},importAllIntoHistory:function(){this.modal.disableButton("Import");var e=this.modal.$("input[name=history_name]").val(),t=this;if(""!==e)$.post(Galaxy.root+"api/histories",{name:e}).done(function(e){t.options.last_used_history_id=e.id,t.processImportToHistory(e.id,e.name)}).fail(function(e,t,i){d.default.error("An error occurred.")}).always(function(){t.modal.enableButton("Import")});else{var i=$("select[name=dataset_import_bulk] option:selected").val();this.options.last_used_history_id=i;var a=$("select[name=dataset_import_bulk] option:selected").text();this.processImportToHistory(i,a),this.modal.enableButton("Import")}},processImportToHistory:function(e,t){var i=[],a=[];this.findCheckedRows().each(function(){var e=$(this).closest("tr").data("id");"F"==e.substring(0,1)?a.push(e):i.push(e)});for(var o=[],s=i.length-1;s>=0;s--){var l=i[s];(n=new c.default.HistoryItem).url=n.urlRoot+e+"/contents",n.content=l,n.source="library",o.push(n)}for(s=a.length-1;s>=0;s--){var r=a[s],n=new c.default.HistoryItem;n.url=n.urlRoot+e+"/contents",n.content=r,n.source="library_folder",o.push(n)}this.initChainCallControl({length:o.length,action:"to_history",history_name:t}),jQuery.getJSON(Galaxy.root+"history/set_as_current?id="+e),this.chainCallImportingIntoHistory(o,t)},updateProgress:function(){this.progress+=this.progressStep,$(".progress-bar-import").width(Math.round(this.progress)+"%");var e=Math.round(this.progress)+"% Complete";$(".completion_span").text(e)},download:function(e,t){var i=[],a=[];this.findCheckedRows().each(function(){var e=$(this).closest("tr").data("id");"F"==e.substring(0,1)?a.push(e):i.push(e)});var o=Galaxy.root+"api/libraries/datasets/download/"+t,s={ld_ids:i,folder_ids:a};this.processDownload(o,s,"get")},processDownload:function(e,t,i){if(e&&t){t="string"==typeof t?t:$.param(t);var a="";$.each(t.split("&"),function(){var e=this.split("=");a+='<input type="hidden" name="'+e[0]+'" value="'+e[1]+'" />'}),$('<form action="'+e+'" method="'+(i||"post")+'">'+a+"</form>").appendTo("body").submit().remove(),d.default.info("Your download will begin soon.")}else d.default.error("An error occurred.")},addFilesFromHistoryModal:function(){this.histories=new c.default.GalaxyHistories;var e=this;this.histories.fetch().done(function(){e.modal=Galaxy.modal;var t=e.templateAddFilesFromHistory();e.modal.show({closing_events:!0,title:"Adding datasets from your history",body:t({histories:e.histories.models}),buttons:{Add:function(){e.addAllDatasetsFromHistory()},Close:function(){Galaxy.modal.hide()}},closing_callback:function(){Galaxy.libraries.library_router.navigate("folders/"+e.id,{trigger:!0})}}),e.fetchAndDisplayHistoryContents(e.histories.models[0].id),$("#dataset_add_bulk").change(function(t){e.fetchAndDisplayHistoryContents(t.target.value)})}).fail(function(e,t){void 0!==t.responseJSON?d.default.error(t.responseJSON.err_msg):d.default.error("An error occurred.")})},importFilesFromPathModal:function(){var e=this;this.modal=Galaxy.modal;var t=this.templateImportPathModal();this.modal.show({closing_events:!0,title:"Please enter paths to import",body:t({}),buttons:{Import:function(){e.importFromPathsClicked(e)},Close:function(){Galaxy.modal.hide()}},closing_callback:function(){Galaxy.libraries.library_router.navigate("folders/"+e.id,{trigger:!0})}}),this.renderSelectBoxes()},fetchExtAndGenomes:function(){var e=this;n.default.get({url:Galaxy.root+"api/datatypes?extension_only=False",success:function(t){e.list_extensions=[];for(var i in t)e.list_extensions.push({id:t[i].extension,text:t[i].extension,description:t[i].description,description_url:t[i].description_url});e.list_extensions.sort(function(e,t){return e.id>t.id?1:e.id<t.id?-1:0}),e.list_extensions.unshift(e.auto)},cache:!0}),n.default.get({url:Galaxy.root+"api/genomes",success:function(t){e.list_genomes=[];for(var i in t)e.list_genomes.push({id:t[i][1],text:t[i][0]});e.list_genomes.sort(function(e,t){return e.id>t.id?1:e.id<t.id?-1:0})},cache:!0})},renderSelectBoxes:function(){var e=this;this.select_genome=new p.default.View({css:"library-genome-select",data:e.list_genomes,container:Galaxy.modal.$el.find("#library_genome_select"),value:"?"}),this.select_extension=new p.default.View({css:"library-extension-select",data:e.list_extensions,container:Galaxy.modal.$el.find("#library_extension_select"),value:"auto"})},importFilesFromGalaxyFolderModal:function(e){var t=this,i=this.templateBrowserModal();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Please select folders or files",body:i({}),buttons:{Import:function(){t.importFromJstreePath(t,e)},Close:function(){Galaxy.modal.hide()}},closing_callback:function(){Galaxy.libraries.library_router.navigate("folders/"+t.id,{trigger:!0})}}),$(".libimport-select-all").bind("click",function(){$("#jstree_browser").jstree("check_all")}),$(".libimport-select-none").bind("click",function(){$("#jstree_browser").jstree("uncheck_all")}),this.renderSelectBoxes(),e.disabled_jstree_element="folders",this.renderJstree(e),$("input[type=radio]").change(function(i){"jstree-disable-folders"===i.target.value?(e.disabled_jstree_element="folders",t.renderJstree(e),$(".jstree-folders-message").hide(),$(".jstree-preserve-structure").hide(),$(".jstree-files-message").show()):"jstree-disable-files"===i.target.value&&($(".jstree-files-message").hide(),$(".jstree-folders-message").show(),$(".jstree-preserve-structure").show(),e.disabled_jstree_element="files",t.renderJstree(e))})},renderJstree:function(e){this.options=_.extend(this.options,e);var t=e.source||"userdir",i=this.options.disabled_jstree_element;this.jstree=new c.default.Jstree,this.jstree.url=this.jstree.urlRoot+"?target="+t+"&format=jstree&disable="+i,this.jstree.fetch({success:function(e,t){$("#jstree_browser").jstree("destroy"),$("#jstree_browser").jstree({core:{data:e},plugins:["types","checkbox"],types:{folder:{icon:"jstree-folder"},file:{icon:"jstree-file"}},checkbox:{three_state:!1}})},error:function(e,t){void 0!==t.responseJSON?404001===t.responseJSON.err_code?d.default.warning(t.responseJSON.err_msg):d.default.error(t.responseJSON.err_msg):d.default.error("An error occurred.")}})},importFromPathsClicked:function(){var e=this.modal.$el.find(".preserve-checkbox").is(":checked"),t=this.modal.$el.find(".link-checkbox").is(":checked"),i=this.modal.$el.find(".spacetab-checkbox").is(":checked"),a=this.modal.$el.find(".posix-checkbox").is(":checked"),o=this.modal.$el.find(".tag-files").is(":checked"),s=this.select_extension.value(),l=this.select_genome.value(),r=$("textarea#import_paths").val(),n=[];if(r){this.modal.disableButton("Import");for(var c=(r=r.split("\n")).length-1;c>=0;c--){var p=r[c].trim();0!==p.length&&n.push(p)}this.initChainCallControl({length:n.length,action:"adding_datasets"}),this.chainCallImportingFolders({paths:n,preserve_dirs:e,link_data:t,space_to_tab:i,to_posix_lines:a,source:"admin_path",file_type:s,tag_using_filenames:o,dbkey:l})}else d.default.info("Please enter a path relative to Galaxy root.")},initChainCallControl:function(e){var t;switch(e.action){case"adding_datasets":t=this.templateAddingDatasetsProgressBar(),this.modal.$el.find(".modal-body").html(t({folder_name:this.options.folder_name}));break;case"deleting_datasets":t=this.templateDeletingItemsProgressBar(),this.modal.$el.find(".modal-body").html(t());break;case"to_history":t=this.templateImportIntoHistoryProgressBar(),this.modal.$el.find(".modal-body").html(t({history_name:e.history_name}));break;default:Galaxy.emit.error("Wrong action specified.","datalibs")}this.progress=0,this.progressStep=100/e.length,this.options.chain_call_control.total_number=e.length,this.options.chain_call_control.failed_number=0},importFromJstreePath:function(e,t){var i=$("#jstree_browser").jstree().get_selected(!0),a=_.filter(i,function(e){return 0==e.state.disabled}),o=this.modal.$el.find(".preserve-checkbox").is(":checked"),s=this.modal.$el.find(".link-checkbox").is(":checked"),l=this.modal.$el.find(".spacetab-checkbox").is(":checked"),r=this.modal.$el.find(".posix-checkbox").is(":checked"),n=this.select_extension.value(),c=this.select_genome.value(),p=this.modal.$el.find(".tag-files").is(":checked"),h=a[0].type,u=[];if(a.length<1)d.default.info("Please select some items first.");else{this.modal.disableButton("Import");for(var m=a.length-1;m>=0;m--)void 0!==a[m].li_attr.full_path&&u.push(a[m].li_attr.full_path);if(this.initChainCallControl({length:u.length,action:"adding_datasets"}),"folder"===h){f=t.source+"_folder";this.chainCallImportingFolders({paths:u,preserve_dirs:o,link_data:s,space_to_tab:l,to_posix_lines:r,source:f,file_type:n,dbkey:c,tag_using_filenames:p})}else if("file"===h){var f=t.source+"_file";this.chainCallImportingUserdirFiles({paths:u,file_type:n,dbkey:c,link_data:s,space_to_tab:l,to_posix_lines:r,source:f,tag_using_filenames:p})}}},fetchAndDisplayHistoryContents:function(e){var t=this;new c.default.HistoryContents({id:e}).fetch({success:function(i){var a=t.templateHistoryContents();t.histories.get(e).set({contents:i}),t.modal.$el.find("#selected_history_content").html(a({history_contents:i.models.reverse()})),t.modal.$el.find(".history-import-select-all").bind("click",function(){$("#selected_history_content [type=checkbox]").prop("checked",!0)}),t.modal.$el.find(".history-import-unselect-all").bind("click",function(){$("#selected_history_content [type=checkbox]").prop("checked",!1)})},error:function(e,t){void 0!==t.responseJSON?d.default.error(t.responseJSON.err_msg):d.default.error("An error occurred.")}})},addAllDatasetsFromHistory:function(){var e=this.modal.$el.find("#selected_history_content").find(":checked"),t=[],i=[],a=[];if(e.length<1)d.default.info("You must select some datasets first.");else{this.modal.disableButton("Add"),e.each(function(){var e=$(this).closest("li").data("id");if(e){var a=$(this).closest("li").data("name");t.push(e),i.push(a)}});for(var o=t.length-1;o>=0;o--){var s=t[o],l=new c.default.Item;l.url=Galaxy.root+"api/folders/"+this.options.id+"/contents","collection"===i[o]?l.set({from_hdca_id:s}):l.set({from_hda_id:s}),a.push(l)}this.initChainCallControl({length:a.length,action:"adding_datasets"}),this.chainCallAddingHdas(a)}},chainCallImportingIntoHistory:function(e,t){var i=this,a=e.pop();if(void 0===a)return 0===this.options.chain_call_control.failed_number?d.default.success("Selected datasets imported into history. Click this to start analyzing it.","",{onclick:function(){window.location=Galaxy.root}}):this.options.chain_call_control.failed_number===this.options.chain_call_control.total_number?d.default.error("There was an error and no datasets were imported into history."):this.options.chain_call_control.failed_number<this.options.chain_call_control.total_number&&d.default.warning("Some of the datasets could not be imported into history. Click this to see what was imported.","",{onclick:function(){window.location=Galaxy.root}}),Galaxy.modal.hide(),!0;$.when(a.save({content:a.content,source:a.source})).done(function(){i.updateProgress(),i.chainCallImportingIntoHistory(e,t)}).fail(function(){i.options.chain_call_control.failed_number+=1,i.updateProgress(),i.chainCallImportingIntoHistory(e,t)})},chainCallImportingUserdirFiles:function(e){var t=this,i=e.paths.pop();if(void 0===i)return 0===this.options.chain_call_control.failed_number?(d.default.success("Selected files imported into the current folder"),Galaxy.modal.hide()):d.default.error("An error occured."),!0;$.when($.post(Galaxy.root+"api/libraries/datasets?encoded_folder_id="+t.id+"&source="+e.source+"&path="+i+"&file_type="+e.file_type+"&link_data="+e.link_data+"&space_to_tab="+e.space_to_tab+"&to_posix_lines="+e.to_posix_lines+"&dbkey="+e.dbkey+"&tag_using_filenames="+e.tag_using_filenames)).done(function(i){t.updateProgress(),t.chainCallImportingUserdirFiles(e)}).fail(function(){t.options.chain_call_control.failed_number+=1,t.updateProgress(),t.chainCallImportingUserdirFiles(e)})},chainCallImportingFolders:function(e){var t=this,i=e.paths.pop();if(void 0===i)return 0===this.options.chain_call_control.failed_number?(d.default.success("Selected folders and their contents imported into the current folder."),Galaxy.modal.hide()):d.default.error("An error occured."),!0;$.when($.post(Galaxy.root+"api/libraries/datasets?encoded_folder_id="+t.id+"&source="+e.source+"&path="+i+"&preserve_dirs="+e.preserve_dirs+"&link_data="+e.link_data+"&to_posix_lines="+e.to_posix_lines+"&space_to_tab="+e.space_to_tab+"&file_type="+e.file_type+"&dbkey="+e.dbkey+"&tag_using_filenames="+e.tag_using_filenames)).done(function(i){t.updateProgress(),t.chainCallImportingFolders(e)}).fail(function(){t.options.chain_call_control.failed_number+=1,t.updateProgress(),t.chainCallImportingFolders(e)})},chainCallAddingHdas:function(e){var t=this;this.added_hdas=new c.default.Folder;var i=e.pop();if(void 0===i)return 0===this.options.chain_call_control.failed_number?d.default.success("Selected datasets from history added to the folder"):this.options.chain_call_control.failed_number===this.options.chain_call_control.total_number?d.default.error("There was an error and no datasets were added to the folder."):this.options.chain_call_control.failed_number<this.options.chain_call_control.total_number&&d.default.warning("Some of the datasets could not be added to the folder"),Galaxy.modal.hide(),this.added_hdas;$.when(i.save({from_hda_id:i.get("from_hda_id")})).done(function(i){Galaxy.libraries.folderListView.collection.add(i),t.updateProgress(),t.chainCallAddingHdas(e)}).fail(function(){t.options.chain_call_control.failed_number+=1,t.updateProgress(),t.chainCallAddingHdas(e)})},chainCallDeletingItems:function(e){var t=this;this.deleted_items=new c.default.Folder;var i=e.pop();if(void 0===i)return 0===this.options.chain_call_control.failed_number?d.default.success("Selected items were deleted."):this.options.chain_call_control.failed_number===this.options.chain_call_control.total_number?d.default.error("There was an error and no items were deleted. Please make sure you have sufficient permissions."):this.options.chain_call_control.failed_number<this.options.chain_call_control.total_number&&d.default.warning("Some of the items could not be deleted. Please make sure you have sufficient permissions."),Galaxy.modal.hide(),this.deleted_items;i.destroy().done(function(a){if(Galaxy.libraries.folderListView.collection.remove(i.id),t.updateProgress(),Galaxy.libraries.folderListView.options.include_deleted){var o=null;"folder"===a.type||"LibraryFolder"===a.model_class?o=new c.default.FolderAsModel(a):"file"===a.type||"LibraryDataset"===a.model_class?o=new c.default.Item(a):(Galaxy.emit.error("Unknown library item type found.","datalibs"),Galaxy.emit.error(a.type||a.model_class,"datalibs")),Galaxy.libraries.folderListView.collection.add(o)}t.chainCallDeletingItems(e)}).fail(function(){t.options.chain_call_control.failed_number+=1,t.updateProgress(),t.chainCallDeletingItems(e)})},checkIncludeDeleted:function(e){e.target.checked?Galaxy.libraries.folderListView.fetchFolder({include_deleted:!0}):Galaxy.libraries.folderListView.fetchFolder({include_deleted:!1})},deleteSelectedItems:function(){var e=[],t=[],i=this.findCheckedRows();if(0===i.length)d.default.info("You must select at least one item for deletion.");else{var a=this.templateDeletingItemsProgressBar();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Deleting selected items",body:a({}),buttons:{Close:function(){Galaxy.modal.hide()}}}),this.options.chain_call_control.total_number=0,this.options.chain_call_control.failed_number=0,i.each(function(){var i=$(this).closest("tr").data("id");void 0!==i&&("F"==i.substring(0,1)?t.push(i):e.push(i))});var o=e.length+t.length;this.progressStep=100/o,this.progress=0;for(var s=[],l=e.length-1;l>=0;l--){var r=new c.default.Item({id:e[l]});s.push(r)}for(l=t.length-1;l>=0;l--){var n=new c.default.FolderAsModel({id:t[l]});s.push(n)}this.options.chain_call_control.total_number=o,this.chainCallDeletingItems(s)}},showLocInfo:function(){var e=null,t=this;null!==Galaxy.libraries.libraryListView?(e=Galaxy.libraries.libraryListView.collection.get(this.options.parent_library_id),this.showLocInfoModal(e)):(e=new c.default.Library({id:this.options.parent_library_id})).fetch({success:function(){t.showLocInfoModal(e)},error:function(e,t){void 0!==t.responseJSON?d.default.error(t.responseJSON.err_msg):d.default.error("An error occurred.")}})},showLocInfoModal:function(e){var t=this,i=this.templateLocInfoInModal();this.modal=Galaxy.modal,this.modal.show({closing_events:!0,title:"Location Details",body:i({library:e,options:t.options}),buttons:{Close:function(){Galaxy.modal.hide()}}})},showImportModal:function(e){switch(e.source){case"history":this.addFilesFromHistoryModal();break;case"importdir":this.importFilesFromGalaxyFolderModal({source:"importdir"});break;case"path":this.importFilesFromPathModal();break;case"userdir":this.importFilesFromGalaxyFolderModal({source:"userdir"});break;default:Galaxy.libraries.library_router.back(),d.default.error("Invalid import source.")}},showPageSizePrompt:function(){var e=prompt("How many items per page do you want to see?",Galaxy.libraries.preferences.get("folder_page_size"));null!=e&&e==parseInt(e)&&(Galaxy.libraries.preferences.set({folder_page_size:parseInt(e)}),Galaxy.libraries.folderListView.render({id:this.options.id,show_page:1}))},findCheckedRows:function(){return $("#folder_list_body").find(":checked")},templateToolBar:function(){return _.template(['<div class="library_style_container">','<div id="library_toolbar">','<form class="form-inline" role="form">',"<span><strong>DATA LIBRARIES</strong></span>",'<span class="library-paginator folder-paginator"></span>','<div class="checkbox toolbar-item logged-dataset-manipulation" style="height: 20px; display:none;">',"<label>",'<input id="include_deleted_datasets_chk" type="checkbox">include deleted</input>',"</label>","</div>",'<button style="display:none;" data-toggle="tooltip" data-placement="top" title="Create New Folder" id="toolbtn_create_folder" class="btn btn-default primary-button add-library-items toolbar-item" type="button">','<span class="fa fa-plus"></span><span class="fa fa-folder"></span>',"</button>","<% if(mutiple_add_dataset_options) { %>",'<div class="btn-group add-library-items" style="display:none;">','<button title="Add Datasets to Current Folder" id="" type="button" class="primary-button dropdown-toggle" data-toggle="dropdown">','<span class="fa fa-plus"></span><span class="fa fa-file"></span><span class="caret"></span>',"</button>",'<ul class="dropdown-menu" role="menu">','<li><a href="#folders/<%= id %>/import/history"> from History</a></li>',"<% if(Galaxy.config.user_library_import_dir !== null) { %>",'<li><a href="#folders/<%= id %>/import/userdir"> from User Directory</a></li>',"<% } %>","<% if(Galaxy.config.allow_library_path_paste) { %>",'<li class="divider"></li>','<li class="dropdown-header">Admins only</li>',"<% if(Galaxy.config.library_import_dir !== null) { %>",'<li><a href="#folders/<%= id %>/import/importdir">from Import Directory</a></li>',"<% } %>","<% if(Galaxy.config.allow_library_path_paste) { %>",'<li><a href="#folders/<%= id %>/import/path">from Path</a></li>',"<% } %>","<% } %>","</ul>","</div>","<% } else { %>",'<a  data-placement="top" title="Add Datasets to Current Folder" style="display:none;" class="btn btn-default add-library-items" href="#folders/<%= id %>/import/history" role="button">','<span class="fa fa-plus"></span><span class="fa fa-file"></span>',"</a>","<% } %>",'<button data-toggle="tooltip" data-placement="top" title="Import selected datasets into history" id="toolbtn_bulk_import" class="primary-button dataset-manipulation" style="margin-left: 0.5em; display:none;" type="button">','<span class="fa fa-book"></span>',"&nbsp;to History","</button>",'<div class="btn-group dataset-manipulation" style="margin-left: 0.5em; display:none; ">','<button title="Download selected items as archive" type="button" class="primary-button dropdown-toggle" data-toggle="dropdown">','<span class="fa fa-download"></span> Download <span class="caret"></span>',"</button>",'<ul class="dropdown-menu" role="menu">','<li><a href="#/folders/<%= id %>/download/tgz">.tar.gz</a></li>','<li><a href="#/folders/<%= id %>/download/tbz">.tar.bz</a></li>','<li><a href="#/folders/<%= id %>/download/zip">.zip</a></li>',"</ul>","</div>",'<button data-toggle="tooltip" data-placement="top" title="Mark selected items deleted" id="toolbtn_bulk_delete" class="primary-button logged-dataset-manipulation" style="margin-left: 0.5em; display:none; " type="button">','<span class="fa fa-times"></span> Delete</button>','<button data-id="<%- id %>" data-toggle="tooltip" data-placement="top" title="Show location details" class="primary-button toolbtn-show-locinfo" style="margin-left: 0.5em;" type="button">','<span class="fa fa-info-circle"></span>',"&nbsp;Details","</button>",'<span class="help-button" data-toggle="tooltip" data-placement="top" title="See this screen annotated">','<a href="https://galaxyproject.org/data-libraries/screen/folder-contents/" target="_blank">','<button class="primary-button" type="button">','<span class="fa fa-question-circle"></span>',"&nbsp;Help","</button>","</a>","</span>","</div>","</form>",'<div id="folder_items_element">',"</div>",'<div class="folder-paginator paginator-bottom"></div>',"</div>"].join(""))},templateLocInfoInModal:function(){return _.template(["<div>",'<table class="grid table table-condensed">',"<thead>",'<th style="width: 25%;">library</th>',"<th></th>","</thead>","<tbody>","<tr>","<td>name</td>",'<td><%- library.get("name") %></td>',"</tr>",'<% if(library.get("description") !== "") { %>',"<tr>","<td>description</td>",'<td><%- library.get("description") %></td>',"</tr>","<% } %>",'<% if(library.get("synopsis") !== "") { %>',"<tr>","<td>synopsis</td>",'<td><%- library.get("synopsis") %></td>',"</tr>","<% } %>",'<% if(library.get("create_time_pretty") !== "") { %>',"<tr>","<td>created</td>",'<td><span title="<%- library.get("create_time") %>"><%- library.get("create_time_pretty") %></span></td>',"</tr>","<% } %>","<tr>","<td>id</td>",'<td><%- library.get("id") %></td>',"</tr>","</tbody>","</table>",'<table class="grid table table-condensed">',"<thead>",'<th style="width: 25%;">folder</th>',"<th></th>","</thead>","<tbody>","<tr>","<td>name</td>","<td><%- options.folder_name %></td>","</tr>",'<% if(options.folder_description !== "") { %>',"<tr>","<td>description</td>","<td><%- options.folder_description %></td>","</tr>","<% } %>","<tr>","<td>id</td>","<td><%- options.id %></td>","</tr>","</tbody>","</table>","</div>"].join(""))},templateNewFolderInModal:function(){return _.template(['<div id="new_folder_modal">',"<form>",'<input type="text" name="Name" value="" placeholder="Name" autofocus>','<input type="text" name="Description" value="" placeholder="Description">',"</form>","</div>"].join(""))},templateBulkImportInModal:function(){return _.template(["<div>",'<div class="library-modal-item">',"Select history: ",'<select id="dataset_import_bulk" name="dataset_import_bulk" style="width:50%; margin-bottom: 1em; " autofocus>',"<% _.each(histories, function(history) { %>",'<option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>',"<% }); %>","</select>","</div>",'<div class="library-modal-item">',"or create new: ",'<input type="text" name="history_name" value="" placeholder="name of the new history" style="width:50%;">',"</input>","</div>","</div>"].join(""))},templateImportIntoHistoryProgressBar:function(){return _.template(['<div class="import_text">',"Importing selected items to history <b><%= _.escape(history_name) %></b>","</div>",'<div class="progress">','<div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">','<span class="completion_span">0% Complete</span>',"</div>","</div>"].join(""))},templateAddingDatasetsProgressBar:function(){return _.template(['<div class="import_text">',"Adding selected datasets to library folder <b><%= _.escape(folder_name) %></b>","</div>",'<div class="progress">','<div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">','<span class="completion_span">0% Complete</span>',"</div>","</div>"].join(""))},templateDeletingItemsProgressBar:function(){return _.template(['<div class="import_text">',"</div>",'<div class="progress">','<div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">','<span class="completion_span">0% Complete</span>',"</div>","</div>"].join(""))},templateBrowserModal:function(){return _.template(['<div id="file_browser_modal">','<div class="alert alert-info jstree-files-message">All files you select will be imported into the current folder ignoring their folder structure.</div>','<div class="alert alert-info jstree-folders-message" style="display:none;">All files within the selected folders and their subfolders will be imported into the current folder.</div>','<div style="margin-bottom:1em;">','<label title="Switch to selecting files" class="radio-inline import-type-switch">','<input type="radio" name="jstree-radio" value="jstree-disable-folders" checked="checked"> Choose Files',"</label>",'<label title="Switch to selecting folders" class="radio-inline import-type-switch">','<input type="radio" name="jstree-radio" value="jstree-disable-files"> Choose Folders',"</label>","</div>",'<div style="margin-bottom:1em;">','<label class="checkbox-inline jstree-preserve-structure" style="display:none;">','<input class="preserve-checkbox" type="checkbox" value="preserve_directory_structure">',"Preserve directory structure","</label>",'<label class="checkbox-inline">','<input class="link-checkbox" type="checkbox" value="link_files">',"Link files instead of copying","</label>",'<label class="checkbox-inline">','<input class="posix-checkbox" type="checkbox" value="to_posix_lines" checked="checked">',"Convert line endings to POSIX","</label>",'<label class="checkbox-inline">','<input class="spacetab-checkbox" type="checkbox" value="space_to_tab">',"Convert spaces to tabs","</label>","</div>",'<button title="Select all files" type="button" class="button primary-button libimport-select-all">',"Select all","</button>",'<button title="Select no files" type="button" class="button primary-button libimport-select-none">',"Unselect all","</button>","<hr />",'<div id="jstree_browser">',"</div>","<hr />","<p>You can set extension type and genome for all imported datasets at once:</p>","<div>",'Type: <span id="library_extension_select" class="library-extension-select" />','Genome: <span id="library_genome_select" class="library-genome-select" />',"</div>","<br>","<div>",'<label class="checkbox-inline tag-files">',"Tag datasets based on file names.",'<input class="tag-files" type="checkbox" value="tag_using_filenames" checked="checked">',"</label>","</div>","</div>"].join(""))},templateImportPathModal:function(){return _.template(['<div id="file_browser_modal">','<div class="alert alert-info jstree-folders-message">All files within the given folders and their subfolders will be imported into the current folder.</div>','<div style="margin-bottom: 0.5em;">','<label class="checkbox-inline">','<input class="preserve-checkbox" type="checkbox" value="preserve_directory_structure">',"Preserve directory structure","</label>",'<label class="checkbox-inline">','<input class="link-checkbox" type="checkbox" value="link_files">',"Link files instead of copying","</label>","<br>",'<label class="checkbox-inline">','<input class="posix-checkbox" type="checkbox" value="to_posix_lines" checked="checked">',"Convert line endings to POSIX","</label>",'<label class="checkbox-inline">','<input class="spacetab-checkbox" type="checkbox" value="space_to_tab">',"Convert spaces to tabs","</label>","</div>",'<textarea id="import_paths" class="form-control" rows="5" placeholder="Absolute paths (or paths relative to Galaxy root) separated by newline" autofocus></textarea>',"<hr />","<p>You can set extension type and genome for all imported datasets at once:</p>","<div>",'Type: <span id="library_extension_select" class="library-extension-select" />','Genome: <span id="library_genome_select" class="library-genome-select" />',"</div>","<div>",'<label class="checkbox-inline tag-files">',"Tag datasets based on file names.",'<input class="tag-files" type="checkbox" value="tag_using_filenames" checked="checked">',"</label>","</div>","</div>"].join(""))},templateAddFilesFromHistory:function(){return _.template(['<div id="add_files_modal">',"<div>","1.&nbsp;Select history:&nbsp;",'<select id="dataset_add_bulk" name="dataset_add_bulk" style="width:66%; "> ',"<% _.each(histories, function(history) { %>",'<option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>',"<% }); %>","</select>","</div>","<br/>",'<div id="selected_history_content">',"</div>","</div>"].join(""))},templateHistoryContents:function(){return _.template(["<p>2.&nbsp;Choose the datasets to import:</p>","<div>",'<button title="Select all datasets" type="button" class="button primary-button history-import-select-all">',"Select all","</button>",'<button title="Select all datasets" type="button" class="button primary-button history-import-unselect-all">',"Unselect all","</button>","</div>","<br>","<ul>","<% _.each(history_contents, function(history_item) { %>",'<% if (history_item.get("deleted") != true ) { %>','<% var item_name = history_item.get("name") %>','<% if (history_item.get("type") === "collection") { %>','<% var collection_type = history_item.get("collection_type") %>','<% if (collection_type === "list") { %>','<li data-id="<%= _.escape(history_item.get("id")) %>" data-name="<%= _.escape(history_item.get("type")) %>">',"<label>",'<label title="<%= _.escape(item_name) %>">','<input style="margin: 0;" type="checkbox"> <%= _.escape(history_item.get("hid")) %>: ','<%= item_name.length > 75 ? _.escape("...".concat(item_name.substr(-75))) : _.escape(item_name) %> (Dataset Collection)',"</label>","</li>","<% } else { %>",'<li><input style="margin: 0;" type="checkbox" onclick="return false;" disabled="disabled">','<span title="You can convert this collection into a collection of type list using the Collection Tools">','<%= _.escape(history_item.get("hid")) %>: ','<%= item_name.length > 75 ? _.escape("...".concat(item_name.substr(-75))) : _.escape(item_name) %> (Dataset Collection of type <%= _.escape(collection_type) %> not supported.)',"</span>","</li>","<% } %>",'<% } else if (history_item.get("visible") === true && history_item.get("state") === "ok") { %>','<li data-id="<%= _.escape(history_item.get("id")) %>" data-name="<%= _.escape(history_item.get("type")) %>">','<label title="<%= _.escape(item_name) %>">','<input style="margin: 0;" type="checkbox"> <%= _.escape(history_item.get("hid")) %>: ','<%= item_name.length > 75 ? _.escape("...".concat(item_name.substr(-75))) : _.escape(item_name) %>',"</label>","</li>","<% } %>","<% } %>","<% }); %>","</ul>"].join(""))},templatePaginator:function(){return _.template(['<ul class="pagination pagination-sm">',"<% if ( ( show_page - 1 ) > 0 ) { %>","<% if ( ( show_page - 1 ) > page_count ) { %>",'<li><a href="#folders/<%= id %>/page/1"><span class="fa fa-angle-double-left"></span></a></li>','<li class="disabled"><a href="#folders/<%= id %>/page/<% print( show_page ) %>"><% print( show_page - 1 ) %></a></li>',"<% } else { %>",'<li><a href="#folders/<%= id %>/page/1"><span class="fa fa-angle-double-left"></span></a></li>','<li><a href="#folders/<%= id %>/page/<% print( show_page - 1 ) %>"><% print( show_page - 1 ) %></a></li>',"<% } %>","<% } else { %>",'<li class="disabled"><a href="#folders/<%= id %>/page/1"><span class="fa fa-angle-double-left"></span></a></li>','<li class="disabled"><a href="#folders/<%= id %>/page/<% print( show_page ) %>"><% print( show_page - 1 ) %></a></li>',"<% } %>",'<li class="active">','<a href="#folders/<%= id %>/page/<% print( show_page ) %>"><% print( show_page ) %></a>',"</li>","<% if ( ( show_page ) < page_count ) { %>",'<li><a href="#folders/<%= id %>/page/<% print( show_page + 1 ) %>"><% print( show_page + 1 ) %></a></li>','<li><a href="#folders/<%= id %>/page/<% print( page_count ) %>"><span class="fa fa-angle-double-right"></span></a></li>',"<% } else { %>",'<li class="disabled"><a href="#folders/<%= id %>/page/<% print( show_page  ) %>"><% print( show_page + 1 ) %></a></li>','<li class="disabled"><a href="#folders/<%= id %>/page/<% print( page_count ) %>"><span class="fa fa-angle-double-right"></span></a></li>',"<% } %>","</ul>","<span>","&nbsp;showing&nbsp;",'<a data-toggle="tooltip" data-placement="top" title="Click to change the number of items on page" class="page_size_prompt">',"<%- items_shown %>","</a>","&nbsp;of <%- total_items_count %> items","</span>"].join(""))}}));e.default={FolderToolbarView:h}});
//# sourceMappingURL=../../../maps/mvc/library/library-foldertoolbar-view.js.map
