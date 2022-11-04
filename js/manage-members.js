const API_END_POINT ='http://34.93.227.66:8080/lms/api';
const pageSize =5;
let page =1;
getAllMembers();
function getAllMembers(query=`${$('#txt-search').val()}`){
    /* Step 1 --->Initiate a XMLHTTP request*/ //this is called XHR 

    const http = new XMLHttpRequest();



    /* step 2 ---> set an event listner to detect state change*/

    http.addEventListener('readystatechange',()=>{
        // console.log(http.readyState);
        /* can identify status using readystate instance property */
        if(http.readyState===http.DONE){  //reaady state changes 4-done ,3-loading 2-header recieved 1-opened
            if(http.status===200){  //check the status code of the response
                const totalMembers =+http.getResponseHeader('X-Total-Count');  //getting header data for paginated results
                initpagination(totalMembers);
                const members = JSON.parse(http.responseText);
                $('#loader').hide();
                if(members.length===0){
                    $('#tbl-members').addClass('empty');
                }else{
                    $('#tbl-members').removeClass('empty');
                }
                $('#tbl-members tbody tr').remove();
                members.forEach(member => {
                    const rowHtml=`
                        <tr tabindex="0">
                            <td>${member.id}</td>
                            <td>${member.name}</td>
                            <td>${member.address}</td>
                            <td>${member.contact}</td>
                        </tr>
                    `;
                $('#tbl-members tbody').append(rowHtml);
                });
            }else{
                // $('#toast').show();
                showToast('Failed to load the Members','warning');
            }
        }

    });

    /* step-3 -->Open the requst */

    http.open('GET',`${API_END_POINT}/members?size=${pageSize}&page=${page}&q=${query}`,true);  /* here true means assynchronous */

    /* step-4 -->set additionl information for the request */


    /* step-5 -> Send the request */

    http.send();
}


function initpagination(totalMembers){
    const totalPages =Math.ceil(totalMembers/pageSize);
    if(totalPages<=1){
        $('#pagination').addClass('d-none');
    }else{
        $('#pagination').removeClass('d-none');
    }
    let html ='';
    for(let i =1;i<=totalPages;i++){
        html +=`<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#">${i}</a></li>`

    }
     html =`
                <li class="page-item ${page===1?'disabled':''}"><a class="page-link" href="#">Previous</a></li>
                ${html}
                <li class="page-item ${page===totalPages?'disabled':''} "><a class="page-link" href="#">Next</a></li>
            `;
            $('#pagination >.pagination').html(html);
}

$('#pagination > .pagination').click((eventData)=>{
    const elm=eventData.target;
    if(elm && elm.tagName=='A'){
        const activePage =($(elm).text());

        if(activePage==='Next'){
            page++;
            getAllMembers();
        }else if(activePage==='Previous'){
            page--;
            getAllMembers();
        }else{
            if(page!=activePage){
                page=+activePage;
                getAllMembers();
            }
        }
    }
});

$('#txt-search').on('input',()=>{
    page=1;
    getAllMembers();
});


$('#tbl-members tbody').keyup((eventData)=>{
    if(eventData.which===38){
        const elm=document.activeElement.previousElementSibling;
        if(elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }else if(eventData.which===40){
        const elm=document.activeElement.nextElementSibling;
        if(elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }
})

$(document).keydown((eventData)=>{
    if(eventData.ctrlKey && eventData.key ==='/'){
        $('#txt-search').focus();
    }
});

$('#btn-new-member').click(()=>{
    const frmMemberDetail = new bootstrap.Modal(document.getElementById('frm-member-detail'));
    $('#frm-member-detail').addClass('new')
    .on('shown.bs.modal',()=>{
        $('#txt-name').focus();
    });
    frmMemberDetail.show();

});

$('#frm-member-detail form').submit((eventData)=>{
    eventData.preventDefault();
    $('#btn-save').click();
    
});

$('#btn-save').click(async()=>{
    const name =$('#txt-name').val();
    const address =$('#txt-address').val();
    const contact =$('#txt-contact').val();
    let validated =true;

    $('#txt-name,#txt-address,#txt-contact').removeClass('is-invalid');

    if(!/^[A-Za-z ]+$/.test(name)){
        $('#txt-name').addClass('is-invalid').select().focus();
        validated=false;
    }

    if(!/^[A-Za-z0-9|,.:;#/\ -]+$/.test(address)){
        $('#txt-address').addClass('is-invalid').select().focus();
        validated=false;
    }
    if(!/^\d{3}-\d{7}$/.test(contact)){
        $('#txt-contact').addClass('is-invalid').select().focus();
        validated=false;

    }

    if(!validated) return;

    try{
        $('#overlay').removeClass('d-none');
        const {id}=await saveMember();
        $('#overlay').addClass('d-none');
        showToast(`Successfully Saved Successfully with the ID:${id}`,'success');
        $('#txt-name,#txt-address,#txt-contact').val("");
        $('#txt-name').focus();
    }catch(e){
        $('#overlay').addClass('d-none');
        showToast('Failed to save the member,try again!','error');
        $('#txt-name').focus();
    }
});



function saveMember(){
    return new Promise((resolve,reject)=>{  //if  promise completed ->resolve funtion works if not reject funtion works

        const xhr =new XMLHttpRequest();

        xhr.addEventListener('readystatechange',()=>{
            console.log(xhr.readyState,XMLHttpRequest.DONE)
            if(xhr.readyState===xhr.DONE){
                if(xhr.status===201){
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    reject();
                }
            }
        });

        xhr.open('POST',`${API_END_POINT}/members`,true);
        xhr.setRequestHeader('Content-Type','application/json');

        const member ={
            name:$('#txt-name').val(),
            address:$('#txt-address').val(),
            contact:$('#txt-contact').val()
        }
        xhr.send(JSON.stringify(member));

    });
}
// doSomething();
// async function doSomething(){
//     try{
//         await saveMember();
//         console.log('promise eka una widiyatama wada karanawa');

//     }catch(e){
//         console.log('Promise eka kalea');

//     }
// }

// const promise = saveMember();

// promise.then(()=>{
//     console.log('Kiwwa wagema kala..!')
// }).catch(()=>{
//     console.log('promise eka kale...!')
// });

// promise.then(()=>{
//     console.log('Kiwwa wagema kala 1..!')
// }).catch(()=>{
//     console.log('promise eka kale 2...!')
// }).finally(()=>{
//     console.log('wade unath nathath finally wada');
// });




function showToast(msg,msgType='warning'){
    $('#toast').removeClass('text-bg-warning')
    .removeClass('text-bg-primary')
    .removeClass('text-bg-error')
    .removeClass('text-bg-success');

    if(msgType==='success'){
        console.log('success working')
        $('#toast').addClass('text-bg-success');
    }else if(msgType==='error'){
        $('#toast').addClass('text-bg-error');
    }else if(msgType==='info'){
        $('#toast').addClass('text-bg-primary');
    }else{
        $('#toast').addClass('text-bg-warning');
    }      
    $('#toast .toast-body').text(msg);
    $('#toast').toast('show');
}

$('#frm-member-detail').on('hidden.bs.modal',()=>{
    getAllMembers();
});

