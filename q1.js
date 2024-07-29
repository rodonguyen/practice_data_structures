var findDuplicates = function(nums) {
  let result = [];
  let nums_copy = nums
  
  nums.forEach(num => {
    const location = num - 1;
    if (nums[location] === -1){
      result.push(num)
      return;
    }
    nums[location] = -1
  });

  return result;
};

console.log(findDuplicates([4,3,2,7,8,2,3,1]))