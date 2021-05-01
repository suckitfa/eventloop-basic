// for (var i = 1; i < 10; ++i) {
//     console.log(i);
//     setTimeout(() => {
//         console.log(i);
//     });
// }

let name;
setTimeout(() => {
    name = 'bob event';
    console.log(name);
}, 1000);

if (name) {
    name = '我很'
    console.log(name);
}