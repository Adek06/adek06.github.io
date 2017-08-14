def secesionNum(numsList):
    left = []
    right = []
    if len(numsList)<=1:
        #print(numsList)
        return numsList
    else:
        mid = int(len(numsList)/2)
        left = secesionNum(numsList[:mid])
        right = secesionNum(numsList[mid:])
        print("left: "+str(left))
        print("right: "+str(right)+"")
        return sortNum(left,right)

def sortNum(left,right):
    result = []
    i,j = 0,0
    while i<len(left) and j<len(right):
        if left[i] > right[j]:
            result.append(left[i])
            i += 1
        elif left[i] <= right[j]:
            result.append(right[j])
            j += 1
    result += left[i:]
    result += right[j:]
    print("result: "+str(result)+"\n")
    return result

if __name__ == "__main__":
    numsList = [2,4,5,1,6,3,7,0,9,8]
    result = secesionNum(numsList)
    print("OUT: " + str(result))
