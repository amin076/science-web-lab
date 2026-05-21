import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";

import {
  listUsersFunction,
  setUserRoleFunction,
  setUserDisabledFunction,
} from "../../services/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const result = await listUsersFunction();
      setUsers(result.data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid, role) => {
    try {
      await setUserRoleFunction({ uid, role });
      await loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisableToggle = async (uid, disabled) => {
    try {
      await setUserDisabledFunction({
        uid,
        disabled: !disabled,
      });

      await loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
<AdminLayout>
    <Box >
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          User Management
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Select
                    size="small"
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.uid,
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="student">
                      student
                    </MenuItem>

                    <MenuItem value="teacher">
                      teacher
                    </MenuItem>

                    <MenuItem value="admin">
                      admin
                    </MenuItem>
                  </Select>
                </TableCell>

                <TableCell>
                  {user.createdAt}
                </TableCell>

                <TableCell>
                  {user.lastLogin}
                </TableCell>

                <TableCell>
                  {user.disabled
                    ? "Disabled"
                    : "Active"}
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color={
                      user.disabled
                        ? "success"
                        : "error"
                    }
                    onClick={() =>
                      handleDisableToggle(
                        user.uid,
                        user.disabled
                      )
                    }
                  >
                    {user.disabled
                      ? "Enable"
                      : "Disable"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
 </AdminLayout>
  );
}