# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def addTwoNumbers(l1, l2):
        l1_node = result_node = l1
        l2_node = l2
        carry = 0

        while (l1_node != None and l2_node != None) :
            sum = l1_node.val + l2_node.val + carry
            carry = sum // 10
            l1_node.val = sum - carry*10

            if carry == 0 and l1_node.next == None and l2_node.next == None: break
            if l1_node.next == None: l1_node.next = ListNode(0)
            if l2_node.next == None: l2_node.next = ListNode(0)

            l1_node = l1_node.next
            l2_node = l2_node.next


            print('checkpoint1')


    # if (l1_node.next == None and l2_node.next == None and carry > 0):
    #     l1_node.next = ListNode(carry)
    #     print('checkpoint2')

    # if (l1_node.next != None and l2_node.next == None):
    #     while (l1_node.next != None):
    #         l1_node = l1_node.next

    #         sum = l1_node.val + carry
    #         carry = sum // 10
    #         l1_node.val = sum - carry * 10
    #         print('checkpoint3')

    # elif (l1_node.next == None and l2_node.next != None):
    #     l1_node = l2_node.next
    #     while (l2_node.next != None):
    #         l2_node = l2_node.next

    #         sum = l2_node.val + carry
    #         carry = sum // 10
    #         l2_node.val = sum - carry * 10
            
    #         print('checkpoint4')

        return result_node

l10 = ListNode(1)
l11 = ListNode(2)
l12 = ListNode(3)
l13 = ListNode(9)
l14 = ListNode(9)
l15 = ListNode(9)
l10.next = l11
l11.next = l12
l12.next = l13
l13.next = l14
l14.next = l15

l20 = ListNode(1)
l21 = ListNode(2)
l22 = ListNode(9)
l20.next = l21
l21.next = l22


result = addTwoNumbers(l10, l20)
print(result.val)