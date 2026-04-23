# Console Errors Fix Progress

## Plan Status: ✅ APPROVED

### Step 1: Project Setup [TODO]
- [ ] Create TODO.md ✅ **DONE**
- [ ] Install dayjs: `cd client && npm i dayjs`
- [x] Restart dev server after changes

### Step 2: Fix dayjs/Antd DatePicker Error (CRITICAL)
- ✅ Edit `client/src/main.jsx` - Add dayjs plugins (utc, isSameOrBefore, isSameOrAfter)
```
## Step 3: Fix React Key & Select Null Warnings
- ✅ Edit `client/src/components/common/ChartFilters.jsx` - Add null checks for shop.id

### Step 4: Fix Chart Sizing Warnings
- [ ] Read & Edit `client/src/components/common/ChartContainer.jsx` - Add minWidth/minHeight

### Step 5: Fix Password Autocomplete
- ✅ Edit `client/src/pages/auth/Login.jsx` - Add autocomplete="current-password"

### Step 6: Test & Verify
- [ ] Test SuperAdminDashboard - No console errors
- [ ] Verify Landing.jsx charts (sizing only, no logic change)
- [ ] Backend data check: dashboardData.shops has valid id field

**Next Action**: Install dayjs & edit main.jsx**
