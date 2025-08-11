using System.Collections.Generic;
using System.Linq;

public class Solution
{
    public IList<IList<string>> GroupAnagrams(string[] strs)
    {
        Dictionary<string, List<string>> appear = new Dictionary<string, List<string>>();

        for (int i = 0; i < strs.Length; i++)
        {
            char[] chars = strs[i].ToCharArray();
            Array.Sort(chars);
            string sortedStr = new string(chars);

            if (!appear.ContainsKey(sortedStr))
            {
                appear[sortedStr] = new List<string> { strs[i] };
            }
            else
            {
                appear[sortedStr].Add(strs[i]);
            }
        }

        List<IList<string>> output = new List<IList<string>>();
        foreach (var item in appear)
        {
            output.Add(item.Value);
        }

        return output;
    }
}
