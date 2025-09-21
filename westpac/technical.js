/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    let p1 = list1;
    let p2 = list2;

    let headResult = new ListNode();
    let curNode = headResult;

    while (p1 !== null || p2 !== null ) {
        // generate next node 
        curNode.next = new ListNode();
        curNode = curNode.next;

        if (p1 === null) {
            curNode.val = p2.val;
            p2 = p2.next;
            continue;
        } 
        else if (p2 === null) {
            curNode.val = p1.val;
            p1 = p1.next;
            continue;
        } 
        else {
            let p1Greater = p1.val > p2.val;
            if (p1Greater) {
                curNode.val = p1.val;
                p1 = p1.next; 
            } else {
                curNode.val = p2.val;
                p2 = p2.next;
            }
        } 
    }
    return headResult;
};